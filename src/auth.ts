import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { upsertGoogleUser } from "@/lib/repositories/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub && profile.email) {
        const user = await upsertGoogleUser({
          googleSub: profile.sub,
          email: profile.email,
          name: profile.name,
          avatarUrl:
            typeof profile.picture === "string" ? profile.picture : null,
        });
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  trustHost: true,
});
