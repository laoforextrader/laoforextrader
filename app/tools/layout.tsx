import ForceLight from "@/components/theme/ForceLight"

// Pinned to the light palette: the calculators draw their own fixed palette (the lot-curve designer paints a canvas).
// Removing <ForceLight /> opts this route into dark mode — do it once the
// pages have been read through in dark.
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLight />
      {children}
    </>
  )
}
