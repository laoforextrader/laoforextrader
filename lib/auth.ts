import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { upsertSubscriber } from "@/lib/subscribers"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Persist every Google login to a `subscriber` Sanity doc. Failures
      // are swallowed inside upsertSubscriber so a Sanity outage never
      // blocks the user from logging in.
      if (user.email) {
        await upsertSubscriber({
          email: user.email,
          name: user.name,
          source: "google",
          verified: true,
        })
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
  },
  session:  { strategy: "jwt" },
  secret:   process.env.NEXTAUTH_SECRET,
}
