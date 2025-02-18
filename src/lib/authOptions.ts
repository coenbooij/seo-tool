import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";

// Check database connection when the module loads
checkDatabaseConnection().catch(console.error);

const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/webmasters",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) {
          console.error('No email provided');
          return false;
        }

        // Check database connection before proceeding
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
          console.error('Database connection failed');
          return false;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // User exists, create new account if none exists for this provider
          if (!existingUser.accounts.length) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account?.type || 'oauth',
                provider: account?.provider || 'google',
                providerAccountId: account?.providerAccountId || user.id,
                access_token: account?.access_token,
                refresh_token: account?.refresh_token,
                scope: account?.scope,
                expires_at: account?.expires_at,
              },
            });
          }
          return true;
        }

        // Create new user if they don't exist
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            accounts: {
              create: {
                type: account?.type || 'oauth',
                provider: account?.provider || 'google',
                providerAccountId: account?.providerAccountId || user.id,
                access_token: account?.access_token,
                refresh_token: account?.refresh_token,
                scope: account?.scope,
                expires_at: account?.expires_at,
              },
            },
          },
        });

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          // Get the user from database to ensure we have the correct ID
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });
          
          if (dbUser) {
            token.sub = dbUser.id;
            token.id = dbUser.id;
          }
        }
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.scope = account.scope;
          token.expires_at = account.expires_at;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && token.sub) {
          session.user = {
            ...session.user,
            id: token.sub
          };
          if (token.accessToken) {
            session.accessToken = token.accessToken as string;
          }
          if (token.refreshToken) {
            session.refreshToken = token.refreshToken as string;
          }
          if (token.scope) {
            session.scope = token.scope as string;
          }
        } else {
          throw new Error('No user ID in token');
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
  events: {
    async signIn({ user }) {
      console.log('Sign in successful:', user.email);
    },
    async signOut({ session }) {
      console.log('Sign out:', session?.user?.email);
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    newUser: "/dashboard",
  },
  session: {
    strategy: "jwt",
  }
};

export default authOptions;