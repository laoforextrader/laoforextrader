// The single gate for every /api/cron/* route.
//
// Both cron secrets open these routes. They are the owner's own cron
// credentials and carry the same privilege, so honouring only one buys no
// safety — and costs plenty. The old check read
// `CRON_SECRET || BROADCAST_SECRET`, which looks like "either one" but means
// "fall back only when CRON_SECRET is unset". CRON_SECRET *is* set, so
// BROADCAST_SECRET was never consulted, and every cron-job.org job built
// with it answered 401 forever. From the scheduler's side that is
// indistinguishable from a healthy job, which is the same invisible-failure
// shape that cost this pipeline 26 unnoticed days in Oct 2026.
//
// `/api/broadcast/run/*` deliberately stays on BROADCAST_SECRET alone: it is
// a public-ish trigger that pushes to LINE, so it keeps the narrower key.
export function cronAuthorized(req: Request): boolean {
  const accepted = [process.env.CRON_SECRET, process.env.BROADCAST_SECRET]
    .filter((s): s is string => Boolean(s))
  if (accepted.length === 0) return true // nothing configured — local dev
  const bearer = req.headers.get("authorization")
  const query  = new URL(req.url).searchParams.get("secret")
  return accepted.some((s) => bearer === `Bearer ${s}` || query === s)
}
