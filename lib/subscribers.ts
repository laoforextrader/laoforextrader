// Subscriber persistence — used by NextAuth signIn callback and the
// /api/newsletter route. Both code paths upsert a single doc per email
// so we can build a clean broadcast list later without dedup work.

import { sanityWrite } from "@/lib/sanityWrite"

type SubscriberSource = "google" | "newsletter" | "manual"

interface UpsertArgs {
  email: string
  name?: string | null
  userImage?: string | null
  source: SubscriberSource
  /** Set true for OAuth providers (already verified by Google). */
  verified?: boolean
}

/**
 * Insert-or-update a subscriber doc keyed by email. Safe to call on every
 * sign-in: bumps lastLoginAt + loginCount. If the doc doesn't exist yet,
 * creates it with createdAt = now and unsubscribed = false.
 *
 * Returns true on success, false on failure (we never throw — auth must
 * not break if Sanity is down).
 */
export async function upsertSubscriber(args: UpsertArgs): Promise<boolean> {
  if (!args.email) return false
  if (!process.env.SANITY_API_TOKEN) return false

  const email = args.email.trim().toLowerCase()
  const now = new Date().toISOString()

  try {
    const existing = await sanityWrite.fetch<{ _id: string; loginCount?: number } | null>(
      `*[_type == "subscriber" && email == $email][0]{ _id, loginCount }`,
      { email },
    )

    if (existing) {
      await sanityWrite
        .patch(existing._id)
        .set({
          lastLoginAt: now,
          loginCount: (existing.loginCount ?? 0) + 1,
          // Refresh display fields in case the user changed their Google profile
          ...(args.name ? { name: args.name } : {}),
          ...(args.userImage ? { userImage: args.userImage } : {}),
        })
        .commit()
      return true
    }

    await sanityWrite.create({
      _type: "subscriber",
      email,
      name: args.name ?? "",
      userImage: args.userImage ?? "",
      source: args.source,
      verified: !!args.verified,
      unsubscribed: false,
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
    })
    return true
  } catch {
    // Swallow — auth/newsletter callers must not fail because Sanity is down.
    return false
  }
}
