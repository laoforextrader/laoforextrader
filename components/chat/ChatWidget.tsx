"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { X, Send, Minus, Volume2, VolumeX, UserCircle2, ArrowLeft } from "lucide-react"
import styles from "./ChatWidget.module.css"
import { RenderMarkdown } from "./renderMarkdown"
import { RobotIcon } from "./RobotIcon"
import { playBoop, playClick, startStreamSound, stopStreamSound } from "./sounds"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface QuotaState {
  used: number
  limit: number
  tier: "guest" | "user" | "pro"
}

type Mode = "ai" | "admin" | "admin-sent"

const STORAGE_KEY        = "trs-ai-chat-v1"
const SOUND_KEY          = "trs-ai-sound-v1"
const WELCOME_DISMISSED  = "trs-ai-welcome-dismissed-v1"
const WELCOME_DELAY_MS   = 5000

const SUGGESTED: string[] = [
  "Forex ແມ່ນຫຍັງ?",
  "Lot size ຄິດແບບໃດ?",
  "ໂບຣກໃດດີສຳລັບມືໃໝ່?",
  "ສັນຍານ TRS Pro ໃຊ້ແບບໃດ?",
]

export default function ChatWidget() {
  const [open, setOpen]               = useState(false)
  const [mode, setMode]               = useState<Mode>("ai")
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState("")
  const [streaming, setStreaming]     = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [quota, setQuota]             = useState<QuotaState | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [soundOn, setSoundOn]         = useState(true)
  const [submittingAdmin, setSubmittingAdmin] = useState(false)

  const bodyRef     = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const abortRef    = useRef<AbortController | null>(null)

  // Restore conversation + sound pref from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Message[]
        if (Array.isArray(parsed)) setMessages(parsed.slice(-24))
      }
      const s = localStorage.getItem(SOUND_KEY)
      if (s === "0") setSoundOn(false)
    } catch { /* ignore */ }
  }, [])

  // Welcome bubble: once per session, after 5 sec
  useEffect(() => {
    if (sessionStorage.getItem(WELCOME_DISMISSED)) return
    const t = setTimeout(() => setShowWelcome(true), WELCOME_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24))) } catch {}
  }, [messages])
  useEffect(() => {
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0") } catch {}
    if (!soundOn) stopStreamSound() // kill any active hum on mute
  }, [soundOn])

  // Auto-scroll
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, streaming, mode])

  // Focus textarea on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open, mode])

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false)
    sessionStorage.setItem(WELCOME_DISMISSED, "1")
  }, [])

  const openPanel = useCallback(() => {
    setOpen(true)
    dismissWelcome()
  }, [dismissWelcome])

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      // play a quick "tick" when enabling so user hears the change
      if (!v) setTimeout(playClick, 30)
      return !v
    })
  }, [])

  // ── AI: send message + stream response ────────────────────────────
  const sendToAi = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    setError(null)
    if (soundOn) {
      playClick()
      startStreamSound() // continuous hum begins immediately
    }

    const next: Message[] = [...messages, { role: "user", content: trimmed }]
    setMessages(next)
    setInput("")
    setStreaming(true)
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: ctrl.signal,
      })

      if (res.status === 429) {
        const data = await res.json().catch(() => null)
        setMessages((prev) => prev.slice(0, -1))
        setError(`ໃຊ້ໝົດໂຄຕ້າມື້ນີ້ແລ້ວ (${data?.used ?? "?"}/${data?.limit ?? "?"}). ກັບມາໃໝ່ມື້ອື່ນ ຫຼື login ເພື່ອໄດ້ໂຄຕ້າເພີ່ມ.`)
        if (data) setQuota({ used: data.used, limit: data.limit, tier: data.tier })
        return
      }
      if (!res.ok || !res.body) {
        setMessages((prev) => prev.slice(0, -1))
        let detail = ""
        try { detail = (await res.text()).slice(0, 200) } catch {}
        // eslint-disable-next-line no-console
        console.error("[chat] API error", res.status, detail)
        setError(`ມີຂໍ້ຜິດພາດ (${res.status})${detail ? " — " + detail : ""}`)
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let firstDelta = true

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const evt of events) {
          const lines = evt.split("\n")
          let evtName = "message"
          let data = ""
          for (const ln of lines) {
            if (ln.startsWith("event:")) evtName = ln.slice(6).trim()
            else if (ln.startsWith("data:")) data += ln.slice(5).trim()
          }
          if (!data) continue
          if (evtName === "meta") {
            try { setQuota(JSON.parse(data) as QuotaState) } catch {}
          } else if (evtName === "delta") {
            // First token arrived — AI has started typing, kill the
            // "thinking" tick loop. From here the user can see the
            // text appear so the audio cue isn't needed.
            if (firstDelta) {
              firstDelta = false
              stopStreamSound()
            }
            try {
              const parsed = JSON.parse(data) as { text: string }
              setMessages((prev) => {
                const copy = prev.slice()
                const last = copy[copy.length - 1]
                if (last && last.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: last.content + parsed.text }
                }
                return copy
              })
            } catch {}
          } else if (evtName === "error") {
            setMessages((prev) => prev.slice(0, -1))
            try { setError((JSON.parse(data) as { message: string }).message || "ມີຂໍ້ຜິດພາດ") }
            catch { setError("ມີຂໍ້ຜິດພາດ") }
          }
        }
      }

      if (soundOn) playBoop()
    } catch (err: any) {
      if (err?.name === "AbortError") return
      setMessages((prev) => prev.slice(0, -1))
      setError("ການເຊື່ອມຕໍ່ມີບັນຫາ — ກະລຸນາລອງໃໝ່")
    } finally {
      stopStreamSound() // always stop hum, even on error
      setStreaming(false)
      abortRef.current = null
    }
  }, [messages, streaming, soundOn])

  // ── Admin: forward message to admin via /api/chat/contact-admin ──
  const sendToAdmin = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || submittingAdmin) return
    setError(null)
    setSubmittingAdmin(true)
    if (soundOn) playClick()

    // Show the message as a "user" bubble so the conversation feels continuous
    setMessages((prev) => [...prev, { role: "user", content: trimmed }])
    setInput("")

    try {
      const res = await fetch("/api/chat/contact-admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          path: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      })
      if (!res.ok) {
        let detail = ""
        try {
          const data = await res.json()
          detail = data?.detail || data?.error || ""
        } catch {
          try { detail = (await res.text()).slice(0, 200) } catch {}
        }
        // eslint-disable-next-line no-console
        console.error("[chat] contact-admin error", res.status, detail)
        setError(`ສົ່ງບໍ່ສຳເລັດ (${res.status})${detail ? " — " + detail : ""}`)
        return
      }
      setMode("admin-sent")
      if (soundOn) playBoop()
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("[chat] contact-admin network error", err)
      setError("ການເຊື່ອມຕໍ່ມີບັນຫາ — ກະລຸນາລອງໃໝ່")
    } finally {
      setSubmittingAdmin(false)
    }
  }, [submittingAdmin, soundOn])

  const onSend = () => {
    if (mode === "admin") sendToAdmin(input)
    else                  sendToAi(input)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  const onTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  const enterAdminMode = () => {
    setMode("admin")
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }
  const exitAdminMode = () => {
    setMode("ai")
    setError(null)
  }

  const isEmpty = messages.length === 0 && mode === "ai"
  const inputPlaceholder =
    mode === "admin"
      ? "ພິມຂໍ້ຄວາມຫາ admin..."
      : "ພິມຄຳຖາມ... (Enter ສົ່ງ, Shift+Enter ຂຶ້ນແຖວ)"
  const sendDisabled =
    !input.trim() ||
    (mode === "ai" ? streaming : submittingAdmin) ||
    mode === "admin-sent"

  return (
    <>
      {/* Welcome bubble */}
      {!open && showWelcome && (
        <div className={styles.welcomeWrap}>
          <div className={styles.welcomeBubble}>
            ສະບາຍດີ! ມີຄຳຖາມເລື່ອງ Forex ບໍ? ກົດເພື່ອລົມກັບ AI
            <button className={styles.welcomeClose} onClick={dismissWelcome} aria-label="Close welcome">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      {!open && (
        <button className={styles.fab} onClick={openPanel} aria-label="Open TheRocket AI chat">
          <RobotIcon size={38} />
          <span className={styles.fabBadge}>AI</span>
        </button>
      )}

      {/* Backdrop + Panel */}
      <div
        className={`${styles.panelBackdrop} ${open ? styles.open : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`${styles.panel} ${open ? styles.open : ""}`}
        role="dialog"
        aria-label="TheRocket AI"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.avatar}>
              <RobotIcon size={26} state={streaming ? "talking" : "happy"} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.headerTitle}>TheRocket AI</div>
              <div className={styles.headerSub}>
                {mode === "admin" || mode === "admin-sent"
                  ? "ໂໝດຕິດຕໍ່ admin"
                  : "ຜູ້ຊ່ວຍ Forex · ອອນລາຍ 24/7"}
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              onClick={toggleSound}
              aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
              title={soundOn ? "Mute" : "Unmute"}
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setOpen(false)}
              aria-label="Minimize"
              title="Minimize"
            >
              <Minus size={16} />
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setOpen(false)}
              aria-label="Close"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Admin mode banner */}
        {(mode === "admin" || mode === "admin-sent") && (
          <div className={styles.modeBanner}>
            <UserCircle2 size={13} />
            {mode === "admin" ? "ໂໝດສົ່ງຫາ Admin" : "ສົ່ງສຳເລັດ"}
            <button onClick={exitAdminMode}>
              <ArrowLeft size={11} style={{ marginRight: 2, verticalAlign: -1 }} />
              ກັບໄປ AI
            </button>
          </div>
        )}

        {/* Body */}
        <div className={styles.body} ref={bodyRef}>
          {isEmpty && (
            <>
              <div className={styles.welcomeIntro}>
                <div className={styles.welcomeIntroTitle}>
                  <span style={{ verticalAlign: -3, display: "inline-block", marginRight: 4 }}>
                    <RobotIcon size={20} />
                  </span>
                  ສະບາຍດີ! ຂ້ອຍຄື TheRocket AI
                </div>
                <div className={styles.welcomeIntroDesc}>
                  ຜູ້ຊ່ວຍ AI ສອນ Forex ສຳລັບເທຣດເດີລາວ —
                  ຖາມໄດ້ທຸກເລື່ອງກ່ຽວກັບ Forex, Gold, broker ຫຼື ສັນຍານ
                </div>
              </div>

              <div className={styles.suggestLabel}>💡 ຄຳຖາມຍອດນິຍົມ</div>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  className={styles.chip}
                  onClick={() => sendToAi(s)}
                  disabled={streaming}
                >
                  {s}
                </button>
              ))}

              <button
                className={styles.contactAdminBtn}
                onClick={enterAdminMode}
                type="button"
              >
                <UserCircle2 size={16} />
                ຫຼື ສົ່ງຂໍ້ຄວາມຫາ admin ໂດຍກົງ
              </button>
            </>
          )}

          {messages.map((m, i) => {
            const isStreamingAssistant =
              streaming &&
              mode === "ai" &&
              m.role === "assistant" &&
              i === messages.length - 1

            return (
              <div
                key={i}
                className={`${styles.bubbleRow} ${m.role === "user" ? styles.user : ""}`}
              >
                {m.role === "assistant" && (
                  <div className={styles.miniAvatar}>
                    <RobotIcon size={18} state={isStreamingAssistant ? "talking" : "happy"} />
                  </div>
                )}
                <div className={`${styles.bubble} ${styles[m.role]}`}>
                  {m.role === "assistant" ? (
                    m.content === "" && isStreamingAssistant ? (
                      <div className={styles.typing}><span /><span /><span /></div>
                    ) : (
                      <>
                        <RenderMarkdown
                          text={m.content}
                          onContactAdmin={enterAdminMode}
                        />
                        {isStreamingAssistant && <span className={styles.cursor} />}
                      </>
                    )
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            )
          })}

          {mode === "admin-sent" && (
            <div className={styles.confirmCard}>
              <div className={styles.confirmTitle}>
                ✅ ສົ່ງສຳເລັດ
              </div>
              <div className={styles.confirmDesc}>
                Admin ໄດ້ຮັບຂໍ້ຄວາມຂອງເຈົ້າແລ້ວ ແລະຈະຕອບກັບໃນ 5-30 ນາທີ ໃນເວລາທຳການ.<br />
                ກະລຸນາລໍຖ້າ — ບໍ່ຕ້ອງສົ່ງຂໍ້ຄວາມຊໍ້າ.
              </div>
              <div className={styles.confirmActions}>
                <button onClick={exitAdminMode} className={styles.confirmBackBtn}>
                  ກັບໄປຄຸຍກັບ AI
                </button>
              </div>
            </div>
          )}

          {error && <div className={styles.banner}>{error}</div>}
        </div>

        {/* Input — hidden after admin-sent */}
        {mode !== "admin-sent" && (
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder={inputPlaceholder}
              value={input}
              onChange={onTextareaInput}
              onKeyDown={onKeyDown}
              disabled={mode === "ai" ? streaming : submittingAdmin}
              rows={1}
            />
            <button
              className={styles.sendBtn}
              onClick={onSend}
              disabled={sendDisabled}
              aria-label="Send"
            >
              <Send size={17} strokeWidth={2.4} />
            </button>
          </div>
        )}

        {/* Footer — minimal, no Claude attribution */}
        {mode === "ai" && (
          <div className={styles.footer}>
            {quota
              ? quota.tier === "pro"
                ? "∞ ບໍ່ຈຳກັດ"
                : `${quota.used}/${quota.limit} ມື້ນີ້`
              : "ສະຫຼາດ · ປອດໄພ · ພາສາລາວ"}
          </div>
        )}
      </div>
    </>
  )
}
