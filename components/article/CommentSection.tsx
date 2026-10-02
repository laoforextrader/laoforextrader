"use client"
import { useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { Comment } from "@/types"
import { formatDate } from "@/lib/utils"

interface Props {
  articleId: string
  initialComments?: Comment[]
}

export function CommentSection({ articleId, initialComments = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!name.trim() || !content.trim()) return
    setLoading(true)
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, name, content }),
      })
      setSent(true)
      setName(""); setContent("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line-2)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)", marginBottom: 16, display: "flex", alignItems: "center", gap: 7 }}>
        <MessageSquare size={16} /> ຄຳເຫັນ ({comments.length})
      </h3>

      {comments.map(c => (
        <div key={c._id} style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, marginBottom: 10, border: "1px solid var(--line-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{c.name}</span>
            <span style={{ fontSize: 11, color: "var(--fg-4)" }}>{formatDate(c.createdAt)}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6, margin: 0 }}>{c.content}</p>
        </div>
      ))}

      {sent ? (
        <div style={{ padding: 14, background: "var(--success-soft)", border: "1px solid var(--success-line)", borderRadius: 10, color: "var(--success)", fontSize: 13 }}>
          ✓ ຂໍຂອບໃຈ! ຄຳເຫັນຂອງທ່ານຖືກສົ່ງແລ້ວ
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ຊື່ຂອງທ່ານ"
            style={{ padding: "8px 12px", border: "1px solid var(--line-2)", borderRadius: 8, fontSize: 13, color: "var(--fg)", outline: "none" }} />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="ຄຳເຫັນ..." rows={3}
            style={{ padding: "8px 12px", border: "1px solid var(--line-2)", borderRadius: 8, fontSize: 13, color: "var(--fg)", outline: "none", resize: "vertical" }} />
          <button onClick={submit} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "fit-content" }}>
            <Send size={13} /> {loading ? "ກຳລັງສົ່ງ..." : "ສົ່ງຄຳເຫັນ"}
          </button>
        </div>
      )}
    </div>
  )
}
