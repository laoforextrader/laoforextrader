import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId:     process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      authorization: {
        url: "https://www.facebook.com/v18.0/dialog/oauth",
        params: { scope: "public_profile" },
      },
      token: "https://graph.facebook.com/v18.0/oauth/access_token",
      userinfo: {
        url: "https://graph.facebook.com/me",
        params: { fields: "id,name,email,picture.type(large)" },
      },
      profile(profile: any) {
        return {
          id:    profile.id,
          name:  profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
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
