import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/database';
import User from '@/models/User';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          await connectToDB();
          
          const user = await User.findOne({
            $or: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectToDB();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user from Google profile
            const username = user.email?.split('@')[0] || `user_${Date.now()}`;
            existingUser = await User.create({
              username,
              email: user.email,
              provider: 'google',
              googleId: account.providerAccountId,
              image: user.image,
              role: 'user',
            });
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            existingUser.googleId = account.providerAccountId;
            existingUser.provider = 'google';
            existingUser.image = user.image;
            await existingUser.save();
          }
          
          // Store MongoDB _id in user object
          user.id = existingUser._id.toString();
          
          return true;
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On first sign in, store user info in token
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      
      // Always get user from DB to ensure we have MongoDB _id and latest data
      if (token.email) {
        try {
          await connectToDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.sub = dbUser._id.toString(); // Override sub with MongoDB _id
            token.role = dbUser.role;
            token.username = dbUser.username;
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!; // This is now MongoDB _id
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};