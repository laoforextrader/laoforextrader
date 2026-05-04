'use client'
import { useEffect } from 'react'

interface Props { slug: string }

export default function ViewTracker({ slug }: Props) {
  useEffect(() => {
    if (!slug) return
    const key = `viewed:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage might be unavailable (privacy mode) — fire anyway
    }
    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {})
  }, [slug])

  return null
}
