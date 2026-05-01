'use client'
import { useState, useEffect, useRef } from 'react'

interface Heading { id: string; text: string; level: number }

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState('')
  const triedRef = useRef(0)

  useEffect(() => {
    function tryBuild() {
      const els = Array.from(document.querySelectorAll('article h2, article h3, .article-body h2, .article-body h3, h2, h3'))
      if (els.length === 0 && triedRef.current < 10) {
        triedRef.current++
        setTimeout(tryBuild, 300)
        return
      }

      const list: Heading[] = []
      els.forEach((el, i) => {
        const id = el.id || `heading-${i}`
        el.id = id
        list.push({
          id,
          text: el.textContent?.trim() || '',
          level: el.tagName === 'H2' ? 2 : 3
        })
      })
      setHeadings(list)

      const observer = new IntersectionObserver(
        entries => {
          const visible = entries.filter(e => e.isIntersecting)
          if (visible.length > 0) setActive(visible[0].target.id)
        },
        { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
      )
      els.forEach(el => observer.observe(el))
      return () => observer.disconnect()
    }

    const cleanup = tryBuild()
    return () => { if (cleanup) cleanup() }
  }, [])

  if (headings.length === 0) return null

  return (
    <div style={{
      background: '#F0F6FF',
      border: '1.5px solid #BFCFFF',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 28,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#2563EB',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6
      }}>
        📋 ສາລະບານ
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {headings.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={e => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              setActive(h.id)
            }}
            style={{
              display: 'block',
              fontSize: h.level === 3 ? 12 : 13,
              fontWeight: active === h.id ? 700 : 500,
              color: active === h.id ? '#2563EB' : '#374151',
              textDecoration: 'none',
              padding: '5px 10px',
              paddingLeft: h.level === 3 ? 28 : 10,
              borderRadius: 6,
              background: active === h.id ? '#EEF3FF' : 'transparent',
              borderLeft: active === h.id ? '3px solid #2563EB' : '3px solid transparent',
              transition: 'all 0.15s',
              lineHeight: 1.4,
            }}
          >
            {h.level === 3 && (
              <span style={{ color: '#9CA3AF', marginRight: 4 }}>—</span>
            )}
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
