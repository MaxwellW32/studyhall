import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { eq } from 'drizzle-orm';
import { DrizzleAdapter } from '@/lib/auth/drizzle-adapter';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string;
      }

      return session;
    },
    async jwt({ token, user }) {
      const [seenUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, token.email || ''))
        .limit(1);

      if (!seenUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return seenUser
    },
  },
};
