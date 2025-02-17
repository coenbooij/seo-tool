import NextAuth from "next-auth";
import authOptions from "@/lib/authOptions";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };