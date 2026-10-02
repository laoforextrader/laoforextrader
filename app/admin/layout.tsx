import ForceLight from "@/components/theme/ForceLight"

// Pinned to the light palette: an owner-only dashboard with ~80 hand-placed colours.
// Removing <ForceLight /> opts this route into dark mode — do it once the
// pages have been read through in dark.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLight />
      {children}
    </>
  )
}
