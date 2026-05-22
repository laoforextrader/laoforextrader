// Tiny markdown renderer for assistant bubbles. Handles only the formats
// the system prompt actually produces: paragraphs, bullets, ordered lists,
// **bold**, `inline code`, and ```fenced``` code blocks. No heading/link
// support — keeping the surface small avoids pulling in a 30 KB markdown
// library for a feature that only renders short chat replies.
//
// Also: detects the magic token [[CONTACT_ADMIN]] (emitted by the AI when
// it wants to offer an admin handoff) and replaces it with an inline
// button. The system prompt is explicit that the AI must NEVER share
// LINE/Telegram URLs directly — this button is the only path.

import { Fragment, type ReactNode } from "react"
import { UserCircle2 } from "lucide-react"
import styles from "./ChatWidget.module.css"

interface Block {
  type: "p" | "ul" | "ol" | "pre"
  lines: string[]
  lang?: string
}

function tokenizeInline(text: string, onContactAdmin?: () => void): ReactNode[] {
  // Split on `code`, **bold**, and the [[CONTACT_ADMIN]] marker.
  const out: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[\[CONTACT_ADMIN\]\])/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok === "[[CONTACT_ADMIN]]") {
      if (onContactAdmin) {
        out.push(
          <button
            key={key++}
            type="button"
            className={styles.inlineAdminBtn}
            onClick={onContactAdmin}
          >
            <UserCircle2 size={14} />
            ກົດເພື່ອຕິດຕໍ່ admin
          </button>,
        )
      }
      // If no handler provided, silently drop the token (don't leak it)
    } else if (tok.startsWith("**")) {
      out.push(<strong key={key++}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith("`")) {
      out.push(<code key={key++}>{tok.slice(1, -1)}</code>)
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function parseBlocks(src: string): Block[] {
  const lines = src.split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const collected: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        collected.push(lines[i])
        i++
      }
      i++ // skip the closing ```
      blocks.push({ type: "pre", lines: collected, lang })
      continue
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""))
        i++
      }
      blocks.push({ type: "ul", lines: items })
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""))
        i++
      }
      blocks.push({ type: "ol", lines: items })
      continue
    }

    // Blank line → paragraph break
    if (line.trim() === "") { i++; continue }

    // Paragraph: collect consecutive non-blank, non-special lines
    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== ""
           && !lines[i].startsWith("```")
           && !/^\s*[-*]\s+/.test(lines[i])
           && !/^\s*\d+\.\s+/.test(lines[i])) {
      para.push(lines[i])
      i++
    }
    blocks.push({ type: "p", lines: para })
  }
  return blocks
}

export function RenderMarkdown({
  text,
  onContactAdmin,
}: {
  text: string
  onContactAdmin?: () => void
}) {
  const blocks = parseBlocks(text)
  return (
    <>
      {blocks.map((b, idx) => {
        if (b.type === "pre") {
          return (
            <pre key={idx}>
              <code>{b.lines.join("\n")}</code>
            </pre>
          )
        }
        if (b.type === "ul") {
          return (
            <ul key={idx}>
              {b.lines.map((li, i) => (
                <li key={i}>{tokenizeInline(li, onContactAdmin)}</li>
              ))}
            </ul>
          )
        }
        if (b.type === "ol") {
          return (
            <ol key={idx}>
              {b.lines.map((li, i) => (
                <li key={i}>{tokenizeInline(li, onContactAdmin)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={idx}>
            {b.lines.map((ln, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {tokenizeInline(ln, onContactAdmin)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}
