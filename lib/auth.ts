import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/app/models/user';
import { connectMongoose } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await connectMongoose();

        // Handle both email and phone number authentication
        let user;
        if (credentials.email) {
          user = await User.findOne({ email: credentials.email });
        } else if (credentials.phoneNumber) {
          user = await User.findOne({ phoneNumber: credentials.phoneNumber });
        }

        console.log('AUTHORIZE - LOOKUP RESULT:', user);

        if (!user) throw new Error('User not found');

        if (!user.password || typeof credentials.password !== 'string') {
          throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error('Incorrect password');

        console.log('AUTHORIZE - RETURNING USER:', { id: user._id, name: user.name, isAdmin: user.isAdmin });
        return user;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('SIGNIN CALLBACK - user:', user);
      try {
        await connectMongoose();

        let dbUser = await User.findOne({ email: user.email }) || await User.findOne({ phoneNumber: user.phoneNumber });

        if (!dbUser && account?.provider === 'google') {
          dbUser = await User.create({
            name: user.name || 'Unnamed',
            email: user.email,
          });
        } else if (!dbUser && user.phoneNumber) {
          dbUser = await User.findOne({ phoneNumber: user.phoneNumber });
          if (!dbUser) {
            throw new Error('User not found after phone verification');
          }
        } else if (!dbUser) {
          throw new Error('User not found');
        }

        user._id = dbUser._id;
        console.log('SIGNIN CALLBACK - returning true for user:', { id: dbUser._id, name: dbUser.name, isAdmin: dbUser.isAdmin });
        return true;
      } catch (error) {
        console.error('signIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      console.log('JWT CALLBACK - trigger:', trigger);
      console.log('JWT CALLBACK - user:', user ? { id: (user as any)._id, email: (user as any).email, phoneNumber: (user as any).phoneNumber, isAdmin: (user as any).isAdmin } : 'no user');
      console.log('JWT CALLBACK - token before:', { id: token.id, email: token.email, phoneNumber: token.phoneNumber, isAdmin: token.isAdmin });
      
      if (user) {
        const customUser = user as any;
        // Completely replace the token with new user data
        const newToken = {
          id: customUser._id.toString(),
          email: customUser.email,
          phoneNumber: customUser.phoneNumber,
          isAdmin: customUser.isAdmin,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        };
        console.log('JWT CALLBACK - COMPLETELY NEW TOKEN CREATED:', newToken);
        return newToken;
      }
      
      // If no user is provided, return the existing token
      console.log('JWT CALLBACK - token after (no user):', { id: token.id, email: token.email, phoneNumber: token.phoneNumber, isAdmin: token.isAdmin });
      return token;
    },
    async session({ session, token }) {
      console.log('SESSION CALLBACK - token:', { id: token.id, email: token.email, phoneNumber: token.phoneNumber, isAdmin: token.isAdmin });
      
      try {
        await connectMongoose();

      // Always look up the user by phone number or email to ensure we get the correct user
      let dbUser = null;
      if (token?.phoneNumber) {
        dbUser = await User.findOne({ phoneNumber: token.phoneNumber });
        console.log('SESSION CALLBACK - found user by phoneNumber:', dbUser ? { id: dbUser._id, name: dbUser.name, isAdmin: dbUser.isAdmin } : 'not found');
      } else if (token?.email) {
        dbUser = await User.findOne({ email: token.email });
        console.log('SESSION CALLBACK - found user by email:', dbUser ? { id: dbUser._id, name: dbUser.name, isAdmin: dbUser.isAdmin } : 'not found');
      }

      if (dbUser) {
        session.user.id = String(dbUser._id);
        const needsSetup = !dbUser.age || !dbUser.gender || !dbUser.phoneNumber;
        (session.user as any).needsProfileSetup = needsSetup;
        (session.user as any).name = dbUser.name;
        (session.user as any).age = dbUser.age;
        (session.user as any).gender = dbUser.gender;
        (session.user as any).email = dbUser.email;
        (session.user as any).phoneNumber = dbUser.phoneNumber;
        (session.user as any).isAdmin = dbUser.isAdmin;
      }

      console.log('SESSION CALLBACK - final session:', { id: session.user.id, name: (session.user as any).name, isAdmin: (session.user as any).isAdmin });
      return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build-time',
});