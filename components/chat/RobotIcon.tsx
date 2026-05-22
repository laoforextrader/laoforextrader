// Pixar Big-Eye style mascot — round head, no antenna, large solid eyes
// with a white catchlight highlight, simple smile. `state="talking"`
// opens the mouth into a small "o" during streaming.

interface Props {
  size?: number
  state?: "happy" | "talking"
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

export function RobotIcon({
  size = 28,
  state = "happy",
  className,
  style,
  ariaLabel,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {/* Round head */}
      <ellipse cx="16" cy="17" rx="11.5" ry="10.5" fill="#ffffff" />

      {/* Subtle side ears (like rounded headphones) */}
      <ellipse cx="4.6" cy="17" rx="1.9" ry="2.8" fill="#ffffff" />
      <ellipse cx="27.4" cy="17" rx="1.9" ry="2.8" fill="#ffffff" />

      {/* Big solid eyes */}
      <ellipse cx="12" cy="16.2" rx="2.8" ry="3.1" fill="#0F172A" />
      <ellipse cx="20" cy="16.2" rx="2.8" ry="3.1" fill="#0F172A" />

      {/* Pixar catchlight highlights */}
      <circle cx="13.2" cy="14.7" r="1" fill="#ffffff" />
      <circle cx="21.2" cy="14.7" r="1" fill="#ffffff" />
      <circle cx="11" cy="17.2" r="0.45" fill="#ffffff" />
      <circle cx="19" cy="17.2" r="0.45" fill="#ffffff" />

      {/* Mouth */}
      {state === "talking" ? (
        <ellipse cx="16" cy="22.2" rx="1.7" ry="1.4" fill="#4F46E5" />
      ) : (
        <path
          d="M13 21.6 Q16 24 19 21.6"
          stroke="#4F46E5"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}
