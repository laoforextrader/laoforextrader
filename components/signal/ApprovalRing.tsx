"use client"

type RingState = "pending" | "approved" | "rejected"

/**
 * Circular waiting indicator for the payment-approval screen.
 * - pending : a smooth indeterminate gradient ring that spins while the
 *             customer waits for admin approval.
 * - approved: a green disc with a check-mark that draws itself in, plus a
 *             soft expanding "ping" halo.
 * - rejected: a red disc with an X.
 */
export function ApprovalRing({ state, size = 104 }: { state: RingState; size?: number }) {
  if (state === "approved") {
    return (
      <div className="relative inline-flex" style={{ width: size, height: size }}>
        {/* expanding halo */}
        <span
          className="approval-ping absolute inset-0 rounded-full"
          style={{ background: "rgba(16,185,129,0.45)" }}
        />
        <div
          className="approval-pop relative inline-flex items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            background: "linear-gradient(135deg,#10B981,#059669)",
            boxShadow: "0 14px 40px rgba(16,185,129,0.42)",
          }}
        >
          <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              className="approval-check"
              d="M5 12.5 10 17.5 19 7"
              stroke="#fff"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  if (state === "rejected") {
    return (
      <div
        className="approval-pop inline-flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg,#EF4444,#B91C1C)",
          boxShadow: "0 14px 40px rgba(239,68,68,0.40)",
        }}
      >
        <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6 18 18M18 6 6 18" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // pending — indeterminate gradient spinner
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 50 50" role="status" aria-label="ກຳລັງລໍຖ້າ admin">
        <defs>
          <linearGradient id="approvalRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx="25" cy="25" r="20" fill="none" stroke="#E0E7FF" strokeWidth="5" />
        {/* rotating arc */}
        <g className="approval-ring-rotor">
          <circle
            className="approval-ring-arc"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#approvalRingGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      {/* soft pulsing core dot */}
      <span
        className="animate-pulse-dot absolute rounded-full"
        style={{ width: 12, height: 12, background: "linear-gradient(135deg,#3B82F6,#2563EB)" }}
      />
    </div>
  )
}
