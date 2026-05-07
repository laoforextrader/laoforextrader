"use client"
import { useEffect, useRef, useState } from "react"
import type { GoldSnapshot } from "@/lib/gold"

const REFRESH_MS = 60_000

async function fetchSnapshot(): Promise<GoldSnapshot | null> {
  try {
    const res = await fetch("/api/gold", { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as GoldSnapshot
  } catch {
    return null
  }
}

interface UseGoldArgs {
  initial?: GoldSnapshot | null
}

export function useGoldPrice(args: UseGoldArgs = {}) {
  const [snap, setSnap] = useState<GoldSnapshot | null>(args.initial ?? null)
  const [isLive, setIsLive] = useState<boolean>(!!args.initial)
  const mounted = useRef(false)

  const refresh = async () => {
    const s = await fetchSnapshot()
    if (s) {
      setSnap(s)
      setIsLive(true)
    }
  }

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    // If we already have an SSR snapshot, refresh in the background;
    // otherwise fetch once immediately so the user isn't stuck on "Loading…".
    refresh()
    const id = setInterval(refresh, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  return {
    xauusd: snap?.price ?? null,
    laoGoldLAK: snap?.laoGoldLAK ?? null,
    change: snap?.change ?? 0,
    changePct: snap?.changePct ?? 0,
    previousClose: snap?.previousClose ?? null,
    updatedAt: snap?.updatedAt ?? null,
    isLive,
  }
}
