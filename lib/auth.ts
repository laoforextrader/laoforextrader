import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { upsertSubscriber } from "@/lib/subscribers"
import { sanityWrite } from "@/lib/sanityWrite"
import { decryptPII } from "@/lib/pii"
import { readLoginToken, LINK_TTL_MS } from "@/lib/account/loginLink"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    //  The link in a registration email.
    //
    //  Not a password in disguise: the "credential" is a single-use nonce
    //  this site generated and mailed, so holding it proves one thing only
    //  — that the person opened that mailbox. It is burned on arrival, so a
    //  forwarded mail cannot be used a second time, and an expired one is
    //  refused by the timestamp stored beside it rather than by anything
    //  the token says about itself.
    CredentialsProvider({
      id: "link",
      name: "Email link",
      credentials: { token: { label: "token", type: "text" } },
      async authorize(creds) {
        const parsed = readLoginToken(creds?.token)
        if (!parsed) return null
        try {
          const doc = await sanityWrite.fetch<{
            _id: string; emailEnc?: string; nameEnc?: string
            loginNonce?: string; loginNonceAt?: string
          } | null>(
            `*[_type == "subscriber" && emailHash == $h][0]{
              _id, emailEnc, nameEnc, loginNonce, loginNonceAt }`,
            { h: parsed.emailHash },
          )
          if (!doc?.loginNonce || doc.loginNonce !== parsed.nonce) return null
          const age = Date.now() - new Date(doc.loginNonceAt ?? 0).getTime()
          if (!(age >= 0 && age < LINK_TTL_MS)) return null
          if (!doc.emailEnc) return null

          const email = decryptPII(doc.emailEnc)
          if (!email) return null
          let name = ""
          try { name = doc.nameEnc ? decryptPII(doc.nameEnc) : "" } catch {}

          //  Burn it before handing back a session: a crash after this point
          //  costs one re-registration, a crash before it would leave a live
          //  link in a mailbox.
          await sanityWrite.patch(doc._id)
            .set({ verified: true, lastLoginAt: new Date().toISOString() })
            .unset(["loginNonce", "loginNonceAt"])
            .commit()

          return { id: parsed.emailHash, email, name }
        } catch {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Persist every Google login to a `subscriber` Sanity doc. Failures
      // are swallowed inside upsertSubscriber so a Sanity outage never
      // blocks the user from logging in.
      //
      // The link provider has already written its own row and burned the
      // nonce by the time it gets here, so it must not be filed as a
      // Google sign-in on top of that.
      if (user.email && account?.provider === "google") {
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
