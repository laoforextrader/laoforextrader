// A tiny in-process cache for reads that every request repeats.
//
// Why this exists: the contest EA heartbeat used to cost six Sanity requests,
// and four of them asked the same questions over and over — which round is
// open, who is on the board, how many entries are there. With twenty EAs
// beating once a minute that is 170,000 identical queries a month against a
// 250,000-request plan.
//
// The cache is per lambda instance and deliberately best-effort. Nothing
// depends on it being there: a cold instance simply asks Sanity once. The
// only cost of a miss is one query; the only cost of a hit is data up to
// `ttlMs` old, which is why every caller picks its own TTL.
//
// In-flight requests are shared, so ten heartbeats landing on one instance at
// the same second produce one query, not ten.

interface Slot<T> {
  value?: T
  expires: number
  inflight?: Promise<T>
}

// globalThis so the cache survives hot reloads in dev and module re-evaluation.
const slots: Map<string, Slot<unknown>> =
  (globalThis as any).__memoSlots ?? ((globalThis as any).__memoSlots = new Map())

/**
 * Run `fn`, or hand back what it returned less than `ttlMs` ago.
 *
 * A rejected call is never cached: the next caller tries again.
 */
export function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const slot = slots.get(key) as Slot<T> | undefined

  if (slot) {
    if (slot.inflight) return slot.inflight
    if (slot.expires > now && "value" in slot) return Promise.resolve(slot.value as T)
  }

  const inflight = fn()
    .then(value => {
      slots.set(key, { value, expires: Date.now() + ttlMs })
      return value
    })
    .catch(err => {
      //  Drop the slot entirely rather than caching a failure, but keep any
      //  previous value usable if it has not expired yet.
      const prev = slots.get(key) as Slot<T> | undefined
      if (prev?.inflight) delete prev.inflight
      throw err
    })

  slots.set(key, { ...(slot ?? { expires: 0 }), inflight } as Slot<unknown>)
  return inflight
}

/** Forget one key, or every key starting with `prefix`. Used after a write. */
export function forget(prefix: string): void {
  for (const key of slots.keys()) {
    if (key === prefix || key.startsWith(prefix)) slots.delete(key)
  }
}
