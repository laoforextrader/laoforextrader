// Subscriber persistence — used by the NextAuth signIn callback and the
// /api/newsletter route. One doc per person, so a broadcast list can be built
// later without dedup work.
//
// The dataset is PUBLIC (private datasets are a paid Sanity feature), so no
// address is stored in the clear. Each doc carries:
//
//   emailHash  blind index — HMAC of the lowercased address. Deterministic,
//              so the upsert can still find "is this person already here?"
//              without anything being readable.
//   emailEnc   AES-256-GCM ciphertext. The one field that must be reversible:
//              you cannot send mail to a hash.
//   nameEnc    same, for the display name.
//
// The Google avatar URL used to be stored too. Nothing ever read it and it
// points at a photo of the person, so it is no longer written.

import { sanityWrite } from "@/lib/sanityWrite"
import { blindIndex, encryptPII, piiReady } from "@/lib/pii"

type SubscriberSource = "google" | "newsletter" | "manual"

interface UpsertArgs {
  email: string
  name?: string | null
  source: SubscriberSource
  /** Set true for OAuth providers (already verified by Google). */
  verified?: boolean
  /**
   * Permission to email this person. Only ever true when they asked for it —
   * a Google sign-in must leave this alone, because logging in to comment is
   * not a request for mail.
   */
  optIn?: boolean
}

/**
 * Insert-or-update a subscriber keyed by the blind index of their email.
 * Safe to call on every sign-in: bumps lastLoginAt + loginCount.
 *
 * Returns true on success, false on failure — never throws, because auth must
 * not break if Sanity is down. Also returns false when there is no key
 * material: skipping the write is the safe failure, storing plaintext is not.
 */
export async function upsertSubscriber(args: UpsertArgs): Promise<boolean> {
  if (!args.email) return false
  if (!process.env.SANITY_API_TOKEN) return false
  if (!piiReady()) return false

  const email = args.email.trim().toLowerCase()
  const now = new Date().toISOString()
  const emailHash = blindIndex(email, "subscriber")

  try {
    const existing = await sanityWrite.fetch<{ _id: string; loginCount?: number } | null>(
      `*[_type == "subscriber" && emailHash == $emailHash][0]{ _id, loginCount }`,
      { emailHash },
    )

    if (existing) {
      await sanityWrite
        .patch(existing._id)
        .set({
          lastLoginAt: now,
          loginCount: (existing.loginCount ?? 0) + 1,
          // Refresh in case the display name changed upstream
          ...(args.name ? { nameEnc: encryptPII(args.name) } : {}),
          // Consent is only ever added here, never revoked — withdrawing it is
          // setEmailOptIn's or the unsubscribe route's job.
          ...(args.optIn
            ? { emailOptIn: true, optInAt: now, optInSource: args.source === "newsletter" ? "footer" : "manual", unsubscribed: false }
            : {}),
        })
        .commit()
      return true
    }

    await sanityWrite.create({
      _type: "subscriber",
      emailHash,
      emailEnc: encryptPII(email),
      nameEnc: args.name ? encryptPII(args.name) : undefined,
      source: args.source,
      verified: !!args.verified,
      emailOptIn: !!args.optIn,
      ...(args.optIn ? { optInAt: now, optInSource: args.source === "newsletter" ? "footer" : "manual" } : {}),
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

/**
 * Record (or withdraw) permission to email this person. Separate from
 * upsertSubscriber on purpose: having a subscriber doc means "this person
 * signed in", which is not consent. Only this function grants it.
 */
export async function setEmailOptIn(
  email: string,
  optIn: boolean,
  source: "dashboard" | "footer" | "manual",
): Promise<boolean> {
  if (!email || !process.env.SANITY_API_TOKEN || !piiReady()) return false

  const emailHash = blindIndex(email.trim().toLowerCase(), "subscriber")
  const now = new Date().toISOString()

  try {
    const existing = await sanityWrite.fetch<{ _id: string } | null>(
      `*[_type == "subscriber" && emailHash == $emailHash][0]{ _id }`,
      { emailHash },
    )
    if (!existing) return false

    await sanityWrite
      .patch(existing._id)
      .set(
        optIn
          ? { emailOptIn: true, optInAt: now, optInSource: source, unsubscribed: false }
          // Turning it off from inside the site is the same promise an
          // unsubscribe link makes, so record it the same way.
          : { emailOptIn: false, unsubscribed: true, unsubscribedAt: now },
      )
      .commit()
    return true
  } catch {
    return false
  }
}

/** Current consent state, for rendering the opt-in control. */
export async function getEmailOptIn(email: string): Promise<boolean> {
  if (!email || !piiReady()) return false
  try {
    const emailHash = blindIndex(email.trim().toLowerCase(), "subscriber")
    const doc = await sanityWrite.fetch<{ emailOptIn?: boolean; unsubscribed?: boolean } | null>(
      `*[_type == "subscriber" && emailHash == $emailHash][0]{ emailOptIn, unsubscribed }`,
      { emailHash },
    )
    return !!doc?.emailOptIn && !doc?.unsubscribed
  } catch {
    return false
  }
}
