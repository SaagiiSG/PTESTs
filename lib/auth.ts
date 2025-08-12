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
  // Fix for App Router server-side authentication
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('SIGNIN CALLBACK - user:', user);
      try {
        await connectMongoose();

        const customUser = user as any;
        let dbUser = await User.findOne({ email: customUser.email });

        if (!dbUser && account?.provider === 'google') {
          dbUser = await User.create({
            name: customUser.name || 'Unnamed',
            email: customUser.email,
          });
          console.log('SIGNIN CALLBACK - Created new Google user:', { id: dbUser._id, name: dbUser.name, email: dbUser.email });
        } else if (!dbUser) {
          // For credential logins, the user should already exist.
          // The authorize callback handles the user lookup.
          dbUser = await User.findOne({ email: customUser.email });
          if (!dbUser) {
            return false; // Deny sign-in if user not found
          }
        }

        // Ensure the user object passed to the jwt callback has the id
        user.id = dbUser._id.toString();
        (user as any).isAdmin = dbUser.isAdmin;


        console.log('SIGNIN CALLBACK - returning true for user:', { id: user.id, name: user.name, isAdmin: (user as any).isAdmin });
        return true;
      } catch (error) {
        console.error('signIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
        // On successful sign-in, add the user's ID and admin status to the token
        if (user) {
            token.id = user.id;
            token.isAdmin = (user as any).isAdmin;
        }

        // If the token has an ID, verify it against the database
        if (token.id) {
            await connectMongoose();
            const dbUser = await User.findById(token.id);
            if (!dbUser) {
                // User not found, invalidate the token by returning null
                return null;
            }
        } else {
            // No token ID, invalidate the token
            return null;
        }

        return token;
    },
    async session({ session, token }) {
        if (token && token.id) {
            session.user.id = token.id as string;
            (session.user as any).isAdmin = token.isAdmin as boolean;

            await connectMongoose();
            const dbUser = await User.findById(token.id);
            if (dbUser) {
                session.user.name = dbUser.name;
                session.user.email = dbUser.email;
                (session.user as any).needsProfileSetup = !dbUser.name || !dbUser.dateOfBirth || !dbUser.gender || !dbUser.education || !dbUser.family || !dbUser.position;
            } else {
                return null; // User not found, invalidate session
            }
        } else {
            return null; // No token or token ID, invalidate session
        }

        return session;
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