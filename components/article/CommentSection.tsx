"use client"
import { useState, useEffect } from "react"
import { Comment } from "@/types"
import { formatDate } from "@/lib/utils"
import { Send, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props { articleId: string }

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-8 mt-3")}>
      <div className="w-7 h-7 rounded-full bg-lft-dark3 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        {comment.authorImage
          ? <img src={comment.authorImage} alt={comment.authorName} className="w-full h-full rounded-full object-cover" />
          : <User size={12} className="text-white/30" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-white/70">{comment.authorName}</span>
          <span className="text-[10px] text-white/25">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="font-lao text-[13px] text-white/60 leading-relaxed">{comment.body}</p>
        {depth === 0 && (
          <button className="text-[10px] text-white/25 hover:text-gold mt-1.5 transition-colors">ຕອບກັບ</button>
        )}
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    </div>
  )
}

export function CommentSection({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName]         = useState("")
  const [body, setBody]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState("")

  useEffect(() => {
    fetch(`/api/comments?articleId=${articleId}`)
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []))
      .catch(() => {})
  }, [articleId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, authorName: name, body }),
      })
      const data = await res.json()
      if (data.success) {
        setComments(prev => [data.comment, ...prev])
        setBody("")
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      }
    } catch {
      setError("ມີຂໍ້ຜິດພາດ, ກະລຸນາລອງໃໝ່")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-10 pt-8 border-t border-white/5">
      <h3 className="flex items-center gap-2 font-lao font-semibold text-sm text-white/60 uppercase tracking-widest mb-6">
        <MessageSquare size={13} /> ຄຳເຫັນ
        {comments.length > 0 && (
          <span className="font-mono text-[11px] bg-lft-dark3 px-2 py-0.5 rounded-full text-white/30">{comments.length}</span>
        )}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="card p-5 mb-6">
        <p className="font-lao text-xs text-white/30 mb-4">ຝາກຄຳຄິດເຫັນຂອງທ່ານ</p>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ຊື່ຂອງທ່ານ..."
            maxLength={50}
            className="bg-lft-dark3 border border-white/10 focus:border-gold/40 text-white placeholder-white/20
                       font-lao text-[13px] px-3 py-2.5 rounded outline-none transition-colors"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="ຂຽນຄຳເຫັນ..."
            rows={4}
            maxLength={2000}
            className="bg-lft-dark3 border border-white/10 focus:border-gold/40 text-white placeholder-white/20
                       font-lao text-[13px] px-3 py-2.5 rounded outline-none resize-none transition-colors"
          />
          {error && <p className="font-lao text-xs text-red-400">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white/20">{body.length}/2000</span>
            <button type="submit" disabled={loading || !name.trim() || !body.trim()}
              className={cn(
                "flex items-center gap-2 btn-primary text-xs py-2 px-4",
                (loading || !name.trim() || !body.trim()) && "opacity-40 cursor-not-allowed"
              )}>
              {loading ? "ກຳລັງສົ່ງ..." : sent ? "✓ ສຳເລັດ!" : <><Send size={11} /> ສົ່ງຄຳເຫັນ</>}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 font-lao text-white/20 text-sm">
          ຍັງບໍ່ມີຄຳເຫັນ — ເປັນຄົນທຳອິດ!
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
        </div>
      )}
    </section>
  )
}
