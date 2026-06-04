import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectToDatabase from './lib/mongoose';
import { User } from './models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const allowedEmails = (process.env.WHITELISTED_EMAILS || '').split(',').map((e) => e.trim());
        
        // Allow if email is in the whitelist or if it matches a specific domain (if configured)
        const isAllowed = allowedEmails.includes(user.email || '');
        
        if (!isAllowed) {
          return false; // Deny login
        }

        // Sync user to MongoDB
        try {
          await connectToDatabase();
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            dbUser = await User.create({
              name: user.name || 'Unknown User',
              email: user.email || '',
              role: 'member',
            });
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user for session:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // We'll create a custom login page
  },
});
