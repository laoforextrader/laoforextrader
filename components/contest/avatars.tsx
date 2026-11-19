import type { ReactNode } from "react"

// Twenty-four animal marks, drawn here rather than borrowed.
//
// Emoji were the obvious answer and are the wrong one: 🦊 is a different
// drawing on every phone, Windows renders a flag as two letters, and a board
// where two contestants look identical on one device and different on
// another is worse than no mark at all. These are plain SVG — the same shapes
// for everybody, at any size, in either theme.
//
// Each one is a head built from a handful of primitives on its own coloured
// tile. They are meant to be told apart at 24 pixels, which is the size they
// are used at, so the silhouette carries the animal and the detail inside it
// only confirms what the outline already said.

const INK = "#10131a"

/** The two eyes every face shares, so they sit at the same height. */
const Eyes = ({ y = 26, dx = 7, r = 2.3 }: { y?: number; dx?: number; r?: number }) => (
  <>
    <circle cx={24 - dx} cy={y} r={r} fill={INK} />
    <circle cx={24 + dx} cy={y} r={r} fill={INK} />
  </>
)

/** A muzzle: the small light patch most of these faces carry. */
const Snout = ({ y = 33, rx = 7, ry = 5, fill = "#fff" }) => (
  <ellipse cx="24" cy={y} rx={rx} ry={ry} fill={fill} />
)

const Nose = ({ y = 31, rx = 2.6, ry = 2, fill = INK }) => (
  <ellipse cx="24" cy={y} rx={rx} ry={ry} fill={fill} />
)

export interface AvatarDef {
  id: string
  /** Shown in the picker, in English like every other trading term. */
  label: string
  /** Tile colour. Mid-tone on purpose: it has to hold up on both themes. */
  bg: string
  draw: ReactNode
}

export const AVATARS: AvatarDef[] = [
  {
    id: "fox", label: "Fox", bg: "#e8762c",
    draw: (
      <>
        <path d="M9 13 L18 21 L13 29 Z" fill="#c2561a" />
        <path d="M39 13 L30 21 L35 29 Z" fill="#c2561a" />
        <path d="M24 14 C34 14 38 22 38 28 C38 36 31 41 24 41 C17 41 10 36 10 28 C10 22 14 14 24 14 Z" fill="#f08b3c" />
        <path d="M24 30 C28 30 32 33 32 36 C32 39 28 41 24 41 C20 41 16 39 16 36 C16 33 20 30 24 30 Z" fill="#fff" />
        <Eyes y={27} dx={7} />
        <Nose y={34} />
      </>
    ),
  },
  {
    id: "tiger", label: "Tiger", bg: "#d99214",
    draw: (
      <>
        <circle cx="13" cy="16" r="5" fill="#b8740b" />
        <circle cx="35" cy="16" r="5" fill="#b8740b" />
        <circle cx="24" cy="28" r="14" fill="#f2a62a" />
        <path d="M17 16 L19 23 M31 16 L29 23 M24 15 L24 21" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <Snout y={33} rx={8} ry={5.5} />
        <Eyes y={26} dx={6.5} />
        <Nose y={31.5} />
      </>
    ),
  },
  {
    id: "lion", label: "Lion", bg: "#c98a2e",
    draw: (
      <>
        <circle cx="24" cy="27" r="17" fill="#8d5a16" />
        <circle cx="24" cy="27" r="12.5" fill="#edad46" />
        <Snout y={32} rx={7.5} ry={5} />
        <Eyes y={25} dx={6} />
        <Nose y={30} />
        <path d="M24 32 L24 36" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "bear", label: "Bear", bg: "#8a5a3b",
    draw: (
      <>
        <circle cx="12" cy="16" r="6" fill="#6d432a" />
        <circle cx="36" cy="16" r="6" fill="#6d432a" />
        <circle cx="24" cy="28" r="14.5" fill="#a06b45" />
        <Snout y={33} rx={8} ry={6} fill="#e8d2b8" />
        <Eyes y={25} dx={6.5} />
        <Nose y={31} rx={3} ry={2.2} />
      </>
    ),
  },
  {
    id: "panda", label: "Panda", bg: "#4a5160",
    draw: (
      <>
        <circle cx="12" cy="15" r="6" fill={INK} />
        <circle cx="36" cy="15" r="6" fill={INK} />
        <circle cx="24" cy="28" r="14.5" fill="#fff" />
        <ellipse cx="17" cy="25" rx="5" ry="6" fill={INK} transform="rotate(-18 17 25)" />
        <ellipse cx="31" cy="25" rx="5" ry="6" fill={INK} transform="rotate(18 31 25)" />
        <circle cx="17.5" cy="25.5" r="2" fill="#fff" />
        <circle cx="30.5" cy="25.5" r="2" fill="#fff" />
        <Nose y={33} rx={3} ry={2.2} />
      </>
    ),
  },
  {
    id: "wolf", label: "Wolf", bg: "#5a6472",
    draw: (
      <>
        <path d="M10 12 L19 20 L14 28 Z" fill="#48515d" />
        <path d="M38 12 L29 20 L34 28 Z" fill="#48515d" />
        <path d="M24 14 C33 14 37 21 37 28 C37 35 31 42 24 42 C17 42 11 35 11 28 C11 21 15 14 24 14 Z" fill="#7a8694" />
        <path d="M24 28 L32 33 L24 42 L16 33 Z" fill="#d7dde4" />
        <Eyes y={26} dx={7} />
        <Nose y={32} />
      </>
    ),
  },
  {
    id: "cat", label: "Cat", bg: "#7b61a8",
    draw: (
      <>
        <path d="M11 13 L20 21 L13 26 Z" fill="#6a4f97" />
        <path d="M37 13 L28 21 L35 26 Z" fill="#6a4f97" />
        <circle cx="24" cy="29" r="13.5" fill="#9a7fc9" />
        <Eyes y={27} dx={6.5} r={2.6} />
        <path d="M24 31 L21.5 33.5 L26.5 33.5 Z" fill={INK} />
        <path d="M8 31 L17 33 M8 36 L17 35 M40 31 L31 33 M40 36 L31 35" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      </>
    ),
  },
  {
    id: "dog", label: "Dog", bg: "#b07b3f",
    draw: (
      <>
        <ellipse cx="10" cy="24" rx="5" ry="9" fill="#8a5c26" />
        <ellipse cx="38" cy="24" rx="5" ry="9" fill="#8a5c26" />
        <circle cx="24" cy="27" r="13.5" fill="#cf9a56" />
        <Snout y={33} rx={7.5} ry={5.5} fill="#f3e2c8" />
        <Eyes y={24.5} dx={6} />
        <Nose y={31} rx={3} ry={2.2} />
      </>
    ),
  },
  {
    id: "rabbit", label: "Rabbit", bg: "#c2718c",
    draw: (
      <>
        <ellipse cx="18" cy="12" rx="4" ry="9" fill="#e3a3b8" />
        <ellipse cx="30" cy="12" rx="4" ry="9" fill="#e3a3b8" />
        <ellipse cx="18" cy="12" rx="2" ry="6" fill="#f6d4de" />
        <ellipse cx="30" cy="12" rx="2" ry="6" fill="#f6d4de" />
        <circle cx="24" cy="30" r="12.5" fill="#f0bccb" />
        <Eyes y={29} dx={6} />
        <path d="M24 33 L22 35 L26 35 Z" fill={INK} />
      </>
    ),
  },
  {
    id: "mouse", label: "Mouse", bg: "#6f7a88",
    draw: (
      <>
        <circle cx="12" cy="18" r="7" fill="#aeb8c4" />
        <circle cx="36" cy="18" r="7" fill="#aeb8c4" />
        <circle cx="12" cy="18" r="4" fill="#e6c3cd" />
        <circle cx="36" cy="18" r="4" fill="#e6c3cd" />
        <circle cx="24" cy="30" r="12" fill="#c6cfd9" />
        <Eyes y={28} dx={5.5} r={2} />
        <Nose y={34} rx={2.2} ry={1.8} fill="#d9788f" />
      </>
    ),
  },
  {
    id: "elephant", label: "Elephant", bg: "#6b7f93",
    draw: (
      <>
        <ellipse cx="11" cy="26" rx="7" ry="10" fill="#8ea2b6" />
        <ellipse cx="37" cy="26" rx="7" ry="10" fill="#8ea2b6" />
        <circle cx="24" cy="26" r="12" fill="#a8bccf" />
        <path d="M24 32 C27 32 28 36 26 40 C25 43 21 43 21 40" stroke="#a8bccf" strokeWidth="5" fill="none" strokeLinecap="round" />
        <Eyes y={24} dx={6} r={2.1} />
      </>
    ),
  },
  {
    id: "buffalo", label: "Buffalo", bg: "#5c5248",
    draw: (
      <>
        <path d="M8 20 C4 14 10 10 14 14 C16 16 17 19 17 21" stroke="#e8e0d2" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M40 20 C44 14 38 10 34 14 C32 16 31 19 31 21" stroke="#e8e0d2" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="29" rx="13" ry="12.5" fill="#7a6d5f" />
        <Snout y={34} rx={7.5} ry={5} fill="#d6c9b6" />
        <Eyes y={26} dx={6} />
        <circle cx="21" cy="33" r="1.4" fill={INK} />
        <circle cx="27" cy="33" r="1.4" fill={INK} />
      </>
    ),
  },
  {
    id: "monkey", label: "Monkey", bg: "#9a6a3c",
    draw: (
      <>
        <circle cx="11" cy="24" r="6" fill="#b88049" />
        <circle cx="37" cy="24" r="6" fill="#b88049" />
        <circle cx="24" cy="27" r="13" fill="#b88049" />
        <ellipse cx="24" cy="31" rx="10" ry="9" fill="#f0d2ad" />
        <Eyes y={25} dx={5.5} />
        <ellipse cx="22" cy="33" rx="1.2" ry="1.6" fill={INK} />
        <ellipse cx="26" cy="33" rx="1.2" ry="1.6" fill={INK} />
        <path d="M20 37 Q24 40 28 37" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "koala", label: "Koala", bg: "#73808c",
    draw: (
      <>
        <circle cx="10" cy="22" r="8" fill="#9aa7b3" />
        <circle cx="38" cy="22" r="8" fill="#9aa7b3" />
        <circle cx="10" cy="22" r="4.5" fill="#cfd8e0" />
        <circle cx="38" cy="22" r="4.5" fill="#cfd8e0" />
        <circle cx="24" cy="28" r="12.5" fill="#b4c0cb" />
        <Eyes y={26} dx={5.5} r={2.1} />
        <ellipse cx="24" cy="33" rx="4" ry="3.4" fill={INK} />
      </>
    ),
  },
  {
    id: "deer", label: "Deer", bg: "#a4703f",
    draw: (
      <>
        <path d="M15 16 L12 8 M15 16 L8 12 M33 16 L36 8 M33 16 L40 12" stroke="#d9b183" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="24" cy="30" rx="11.5" ry="12.5" fill="#c08a52" />
        <Snout y={35} rx={6} ry={4.5} fill="#efd9bf" />
        <Eyes y={27} dx={5.5} />
        <Nose y={33.5} rx={2.4} ry={1.8} />
      </>
    ),
  },
  {
    id: "horse", label: "Horse", bg: "#8b6a4f",
    draw: (
      <>
        <path d="M15 15 L17 21 L12 20 Z" fill="#6f523c" />
        <path d="M33 15 L31 21 L36 20 Z" fill="#6f523c" />
        <path d="M24 16 C31 16 34 20 34 25 L32 38 C32 41 28 43 24 43 C20 43 16 41 16 38 L14 25 C14 20 17 16 24 16 Z" fill="#a37f5f" />
        <ellipse cx="24" cy="37" rx="6.5" ry="5" fill="#e3cdb4" />
        <Eyes y={25} dx={7} />
        <circle cx="21.5" cy="36" r="1.4" fill={INK} />
        <circle cx="26.5" cy="36" r="1.4" fill={INK} />
      </>
    ),
  },
  {
    id: "frog", label: "Frog", bg: "#3f8f5a",
    draw: (
      <>
        <circle cx="15" cy="18" r="7" fill="#58b273" />
        <circle cx="33" cy="18" r="7" fill="#58b273" />
        <circle cx="15" cy="18" r="4.4" fill="#fff" />
        <circle cx="33" cy="18" r="4.4" fill="#fff" />
        <circle cx="15" cy="18.5" r="2.2" fill={INK} />
        <circle cx="33" cy="18.5" r="2.2" fill={INK} />
        <ellipse cx="24" cy="31" rx="14" ry="11" fill="#58b273" />
        <path d="M16 33 Q24 39 32 33" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "owl", label: "Owl", bg: "#6b5a7e",
    draw: (
      <>
        <path d="M12 16 L18 22 L12 24 Z" fill="#5a4a6b" />
        <path d="M36 16 L30 22 L36 24 Z" fill="#5a4a6b" />
        <ellipse cx="24" cy="29" rx="13.5" ry="13" fill="#8a76a0" />
        <circle cx="18" cy="26" r="6" fill="#fff" />
        <circle cx="30" cy="26" r="6" fill="#fff" />
        <circle cx="18" cy="26" r="2.8" fill={INK} />
        <circle cx="30" cy="26" r="2.8" fill={INK} />
        <path d="M24 30 L21 34 L27 34 Z" fill="#e8b74a" />
      </>
    ),
  },
  {
    id: "eagle", label: "Eagle", bg: "#4f5d6e",
    draw: (
      <>
        <path d="M24 14 C33 14 38 21 38 28 C38 36 32 42 24 42 C16 42 10 36 10 28 C10 21 15 14 24 14 Z" fill="#fff" />
        <path d="M10 26 C12 18 17 14 24 14 C31 14 36 18 38 26 Z" fill="#dfe5ec" />
        <Eyes y={25} dx={7} r={2.4} />
        <path d="M24 28 L18 33 L24 40 L30 33 Z" fill="#e8a53a" />
      </>
    ),
  },
  {
    id: "penguin", label: "Penguin", bg: "#3f6080",
    draw: (
      <>
        <ellipse cx="24" cy="27" rx="14" ry="15" fill={INK} />
        <ellipse cx="24" cy="30" rx="9.5" ry="12" fill="#fff" />
        <circle cx="19.5" cy="23" r="2.3" fill={INK} />
        <circle cx="28.5" cy="23" r="2.3" fill={INK} />
        <path d="M24 26 L20 30 L28 30 Z" fill="#e8a53a" />
      </>
    ),
  },
  {
    id: "shark", label: "Shark", bg: "#3d6d8c",
    draw: (
      <>
        <path d="M24 10 L29 20 L19 20 Z" fill="#7fa8c2" />
        <ellipse cx="24" cy="28" rx="14" ry="13" fill="#5f8fae" />
        <path d="M10 30 C14 38 34 38 38 30 L38 33 C34 41 14 41 10 33 Z" fill="#e3edf3" />
        <Eyes y={25} dx={7} r={2.2} />
        <path d="M13 32 L18 36 L23 32 L28 36 L33 32 L35 34 L28 40 L23 36 L18 40 L12 34 Z" fill="#fff" />
      </>
    ),
  },
  {
    id: "whale", label: "Whale", bg: "#44749b",
    draw: (
      <>
        <path d="M24 16 C21 11 27 9 28 14" stroke="#cfe3f0" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="23" cy="30" rx="15" ry="11" fill="#6a9cc2" />
        <path d="M9 30 C13 37 33 37 38 30 L38 33 C33 40 13 40 9 34 Z" fill="#cfe3f0" />
        <circle cx="16" cy="27" r="2.3" fill={INK} />
        <path d="M38 24 L45 20 L45 34 L38 30 Z" fill="#4e7fa3" />
      </>
    ),
  },
  {
    id: "turtle", label: "Turtle", bg: "#3f8a7a",
    draw: (
      <>
        <circle cx="38" cy="30" r="6.5" fill="#86c9ab" />
        <circle cx="40" cy="28.5" r="1.8" fill={INK} />
        <ellipse cx="22" cy="28" rx="15" ry="12" fill="#2f7a68" />
        <path d="M22 16 L22 40 M9 24 L35 24 M9 33 L35 33" stroke="#7fc0a8" strokeWidth="1.8" />
        <path d="M10 36 L13 41 M34 36 L31 41" stroke="#86c9ab" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "dragon", label: "Dragon", bg: "#9a3f4e",
    draw: (
      <>
        <path d="M14 14 L18 20 L12 21 Z" fill="#d9a23f" />
        <path d="M34 14 L30 20 L36 21 Z" fill="#d9a23f" />
        <path d="M24 15 C32 15 37 21 37 27 C37 35 31 42 24 42 C17 42 11 35 11 27 C11 21 16 15 24 15 Z" fill="#c25264" />
        <path d="M24 15 L21 10 L27 10 Z" fill="#d9a23f" />
        <Snout y={34} rx={7.5} ry={5} fill="#f0d6a8" />
        <Eyes y={26} dx={6.5} r={2.5} />
        <circle cx="21" cy="33" r="1.5" fill={INK} />
        <circle cx="27" cy="33" r="1.5" fill={INK} />
      </>
    ),
  },
]

/** Stable, well-spread pick from any string — an MT5 login, usually. */
export function avatarIndexFor(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % AVATARS.length
}

export const avatarById = (id?: string) => AVATARS.find(a => a.id === id)

/**
 * The avatar for one entry, chosen if they chose one and derived if not.
 *
 * `taken` lets a board hand out different marks to everyone: the derived pick
 * steps forward until it finds a free one, so two contestants who hash to the
 * same animal do not appear as twins. A mark the contestant picked themselves
 * is never moved.
 */
export function resolveAvatar(id: string | undefined, seed: string, taken?: Set<string>): AvatarDef {
  const chosen = avatarById(id)
  if (chosen) return chosen
  const start = avatarIndexFor(seed)
  for (let i = 0; i < AVATARS.length; i++) {
    const a = AVATARS[(start + i) % AVATARS.length]
    if (!taken || !taken.has(a.id)) return a
  }
  return AVATARS[start]
}

/** One mark, at whatever size the row needs. */
export function ContestAvatar({
  def, size = 28, className = "",
}: { def: AvatarDef; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48" width={size} height={size} className={className}
      role="img" aria-label={def.label}
    >
      <rect width="48" height="48" rx="12" fill={def.bg} />
      {def.draw}
    </svg>
  )
}
