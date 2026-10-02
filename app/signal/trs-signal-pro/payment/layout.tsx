import ForceLight from "@/components/theme/ForceLight"

// Pinned to the light palette: readers compare an uploaded slip against a QR code here.
// Removing <ForceLight /> opts this route into dark mode — do it once the
// pages have been read through in dark.
export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLight />
      {children}
    </>
  )
}
