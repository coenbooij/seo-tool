import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/analytics.readonly"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === "google") {
          // First, find or create the user
          const dbUser = await prisma.user.upsert({
            where: {
              email: user.email ?? '',
            },
            create: {
              email: user.email ?? '',
            },
            update: {},
          });

          // Then, link the Google account
          await prisma.googleAccount.upsert({
            where: {
              googleId: account.providerAccountId,
            },
            update: {
              accessToken: account.access_token ?? '',
              refreshToken: account.refresh_token ?? '',
            },
            create: {
              googleId: account.providerAccountId,
              email: user.email ?? '',
              accessToken: account.access_token ?? '',
              refreshToken: account.refresh_token ?? '',
              userId: dbUser.id,
            },
          });

          token.id = dbUser.id.toString(); // Convert to string for NextAuth
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
