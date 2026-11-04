"use client"

// Each answer is in the DOM whether or not its panel is open, so search
// engines index all of them and Ctrl+F finds them. The panel animates with
// grid-template-rows 0fr→1fr (see .bk-panel in globals.css) rather than
// max-height, which needs a guessed height and clips or stutters when the
// guess is wrong.

import { useState } from "react"

export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0)

  return (
    <div className="divide-y divide-bk-line rounded-bk border border-bk-line">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 bg-transparent px-5 py-5 text-left transition-colors hover:bg-bk-sunken sm:px-7"
              >
                <span className="text-[17px] font-bold leading-snug tracking-[-0.015em] text-bk-ink">
                  {item.q}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`shrink-0 text-bk-muted transition-transform duration-200 motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div className="bk-panel" data-open={isOpen}>
              <div>
                <p className="m-0 px-5 pb-5 text-[15px] leading-[1.8] text-bk-muted sm:px-7">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
