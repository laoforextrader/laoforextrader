import { sanityWrite } from "@/lib/sanityWrite"
import { currentContest, myEntry } from "@/lib/contest/store"
import { accountsOf } from "@/lib/semi/store"

// Everything the signed-in person owns, gathered in one place.
//
// Written because the account page showed a name, a picture and three
// hard-coded zeros: someone who had registered for the contest and linked an
// EA could see none of it, and could not even read back which Google account
// they were signed in as without opening the sign-out menu.
//
// Every query here is keyed to this user. Nothing crosses to another account,
// and the sealed fields (entry code, dashboard key) are opened by the stores
// that own them, for their owner only.

export interface AccountOverview {
  /** Articles and brokers this user has liked — the site's bookmark. */
  likes: number
  /** Comments they have posted, approved or not. */
  comments: number
  /** Their entry in the round that is open now, if any. */
  contest: {
    roundTitle: string
    entryNo?: number
    code: string
    status: string
    lastSeen?: string
    mtLogin?: string
  } | null
  /** Whether a round is open for registration at all. */
  contestOpen: boolean
  /** MT5 accounts linked to the Semi dashboard. */
  eaAccounts: Array<{ account: string; lastSeen?: string; keyTail?: string }>
}

export async function accountOverview(
  email: string,
  userId?: string
): Promise<AccountOverview> {
  const contest = await currentContest()

  // A failure in any one of these is not worth losing the page over: the
  // account screen is the place someone goes when something is already
  // confusing them.
  const [counts, entry, eaAccounts] = await Promise.all([
    userId
      ? sanityWrite
          .fetch<{ likes: number; comments: number }>(
            `{
               "likes": count(*[_type == "like" && userId == $uid]),
               "comments": count(*[_type == "comment" && userId == $uid])
             }`,
            { uid: userId }
          )
          .catch(() => ({ likes: 0, comments: 0 }))
      : Promise.resolve({ likes: 0, comments: 0 }),
    contest ? myEntry(email, contest._id).catch(() => null) : Promise.resolve(null),
    accountsOf(email).catch(() => []),
  ])

  return {
    likes: counts?.likes ?? 0,
    comments: counts?.comments ?? 0,
    contestOpen: !!contest && contest.status === "register",
    contest:
      entry && contest
        ? {
            roundTitle: contest.title,
            entryNo: entry.entryNo,
            code: entry.entryCode ?? "",
            status: entry.status ?? "pending",
            lastSeen: entry.lastSeen,
            mtLogin: entry.mtLogin,
          }
        : null,
    eaAccounts,
  }
}
