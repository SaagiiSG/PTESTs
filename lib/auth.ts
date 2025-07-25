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

        const user = await User.findOne({ phoneNumber: credentials.phoneNumber });
        console.log('LOOKUP BY PHONE:', user);

        if (!user) throw new Error('User not found');

        if (!user.password || typeof credentials.password !== 'string') {
          throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error('Incorrect password');

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
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
        return true;
      } catch (error) {
        console.error('signIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as any;
        if (customUser._id) {
          token.id = customUser._id.toString();
        }
        if (customUser.phoneNumber) {
          token.phoneNumber = customUser.phoneNumber;
        }
        token.email = customUser.email;
      }
      return token;
    },
    async session({ session, token }) {
      await connectMongoose();

      if (token?.id) {
        session.user.id = String(token.id);
      }

      if (token?.phoneNumber || token?.email) {
        const dbUser = await User.findOne({
          $or: [{ phoneNumber: token.phoneNumber }, { email: token.email }],
        });
        if (dbUser) {
          const needsSetup = !dbUser.age || !dbUser.gender || !dbUser.phoneNumber;
          (session.user as any).needsProfileSetup = needsSetup;
          (session.user as any).name = dbUser.name;
          (session.user as any).age = dbUser.age;
          (session.user as any).gender = dbUser.gender;
          (session.user as any).email = dbUser.email;
          (session.user as any).phoneNumber = dbUser.phoneNumber;
          (session.user as any).isAdmin = dbUser.isAdmin;
        }
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Try to detect admin login and redirect to /admin
      try {
        const u = new URL(url, baseUrl);
        if (u.pathname === "/profile" || u.pathname === "/" || u.pathname === "/home") {
          // If session exists and isAdmin, redirect to /admin
          // But we can't access session here, so only redirect if url is /profile or /home
          // Let client-side logic handle further redirects if needed
          // Always allow callback URLs on the same origin
          if (url.startsWith("/admin") || url.startsWith("/profile") || url.startsWith("/home") || url === baseUrl || url === baseUrl + "/") {
            // If the callback URL is /profile or /home, send admin to /admin
            // Otherwise, allow
            if (u.pathname === "/profile" || u.pathname === "/home" || u.pathname === "/") {
              // This will redirect all logins to /admin, but only if the callback is /profile, /home, or root
              return baseUrl + "/admin";
            }
            return url;
          }
        }
        // Allow relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Allow callback URLs on the same origin
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});