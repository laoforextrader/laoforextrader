'use client'
import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

interface Comment {
  _id: string
  userName: string
  userImage?: string
  content: string
  createdAt: string
}

export default function PostEngagement({ postId, postTitle, postUrl }: {
  postId: string, postTitle: string, postUrl: string
}) {
  const { data: session } = useSession()
  const [liked, setLiked]         = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comment, setComment]     = useState('')
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [posting, setPosting]     = useState(false)
  const [liking, setLiking]       = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [likeRes, commentRes] = await Promise.all([
          fetch(`/api/likes?articleId=${postId}`).then(r => r.json()),
          fetch(`/api/comments?articleId=${postId}`).then(r => r.json()),
        ])
        if (cancelled) return
        setLiked(!!likeRes?.liked)
        setLikeCount(Number(likeRes?.count) || 0)
        setComments(Array.isArray(commentRes?.comments) ? commentRes.comments : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [postId, session?.user])

  const handleLike = async () => {
    if (!session) { signIn(); return }
    if (liking) return
    setLiking(true)
    const prevLiked = liked, prevCount = likeCount
    setLiked(!prevLiked)
    setLikeCount(prevCount + (prevLiked ? -1 : 1))
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: postId }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setLiked(!!data.liked)
      setLikeCount(Number(data.count) || 0)
    } catch {
      setLiked(prevLiked); setLikeCount(prevCount)
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async () => {
    if (!session) { signIn(); return }
    if (!comment.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: postId, content: comment }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data?.comment) {
        setComments(prev => [data.comment, ...prev])
        setComment('')
      }
    } finally {
      setPosting(false)
    }
  }

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('lo-LA', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return '' }
  }

  const shareUrl  = encodeURIComponent(postUrl)
  const shareText = encodeURIComponent(postTitle)

  return (
    <div style={{ marginTop: 40, borderTop: '1px solid #E2E6F0', paddingTop: 32 }}>
      {/* Like & Share Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <button
          onClick={handleLike}
          disabled={liking}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: liked ? '#EEF3FF' : '#F9FAFB',
            color: liked ? '#2563EB' : '#6B7280',
            border: liked ? '1.5px solid #BFCFFF' : '1.5px solid #E2E6F0',
            borderRadius: 8, padding: '8px 16px', fontSize: 13,
            fontWeight: 700, cursor: liking ? 'wait' : 'pointer',
            opacity: liking ? 0.7 : 1,
            transition: 'all 0.2s', fontFamily: 'Noto Sans Lao, sans-serif',
          }}
        >
          {liked ? '❤️' : '🤍'} ຖືກໃຈ {likeCount > 0 && `(${likeCount})`}
        </button>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#1877F2', color: '#fff',
            border: 'none', borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}
        >
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          ແຊຣ໌ Facebook
        </a>

        <a
          href={`https://line.me/R/msg/text/?${shareText}%20${shareUrl}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#06C755', color: '#fff',
            border: 'none', borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}
        >
          💬 ແຊຣ໌ LINE
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#000', color: '#fff',
            border: 'none', borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}
        >
          𝕏 Share
        </a>
      </div>

      {/* Comment Section */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          ຄຳເຫັນ ({comments.length})
        </h3>

        {session ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user?.name || ''}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="ຂຽນຄຳເຫັນ..."
              maxLength={2000}
              disabled={posting}
              style={{
                flex: 1, padding: '10px 14px', border: '1.5px solid #E2E6F0',
                borderRadius: 8, fontSize: 14, fontFamily: 'Noto Sans Lao, sans-serif',
                outline: 'none', background: '#fff',
              }}
            />
            <button
              onClick={handleComment}
              disabled={posting || !comment.trim()}
              style={{
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 13, fontWeight: 700,
                cursor: posting || !comment.trim() ? 'not-allowed' : 'pointer',
                opacity: posting || !comment.trim() ? 0.5 : 1,
                fontFamily: 'Noto Sans Lao, sans-serif',
              }}
            >
              {posting ? '...' : 'ສົ່ງ'}
            </button>
          </div>
        ) : (
          <div style={{
            background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: 8,
            padding: '14px 16px', marginBottom: 24, textAlign: 'center',
            fontSize: 13, color: '#6B7280', fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            <button
              onClick={() => signIn()}
              style={{
                background: 'none', border: 'none', color: '#2563EB',
                fontWeight: 700, cursor: 'pointer', fontSize: 13,
                fontFamily: 'Noto Sans Lao, sans-serif',
              }}
            >
              ເຂົ້າສູ່ລະບົບ
            </button>{' '}ເພື່ອຂຽນຄຳເຫັນ
          </div>
        )}

        {loading ? (
          <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            ກຳລັງໂຫຼດ...
          </p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            ຍັງບໍ່ມີຄຳເຫັນ · ເປັນຄົນທຳອິດທີ່ຄອມເມັນ
          </p>
        ) : (
          comments.map(c => (
            <div key={c._id} style={{
              background: '#F9FAFB', border: '1px solid #E2E6F0',
              borderRadius: 8, padding: '12px 16px', marginBottom: 8,
              display: 'flex', gap: 12,
            }}>
              {c.userImage ? (
                <img src={c.userImage} alt={c.userName}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {c.userName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{c.userName}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{formatDate(c.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
