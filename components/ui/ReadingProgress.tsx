'use client'
import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 100) {
        setVisible(true)
        setProgress((scrollTop / docHeight) * 100)
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 4, zIndex: 9999,
      background: 'rgba(0,0,0,0.06)',
      pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #2563EB, #4F46E5, #7C3AED)',
        transition: 'width 0.15s linear',
        borderRadius: '0 3px 3px 0',
        boxShadow: '0 0 10px rgba(37,99,235,0.6)',
      }} />
    </div>
  )
}
