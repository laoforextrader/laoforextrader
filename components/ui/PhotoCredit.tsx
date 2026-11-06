// Credit line for a Pexels photo.
//
// Their API guidelines ask for the photographer to be credited and for a link
// back, and it costs one quiet line. It renders nothing when the image is the
// article's own cover (photo === null), so a card with a real uploaded cover
// never carries somebody else's name.
//
// Deliberately small and muted: this is a licence obligation, not content.

import type { StockPhoto } from "@/lib/images/pexels"

export default function PhotoCredit({ photo }: { photo: StockPhoto | null }) {
  if (!photo?.photographer) return null
  return (
    <p className="m-0 mt-2 text-[11px] leading-tight text-bk-muted">
      ຮູບ:{" "}
      <a
        href={photo.photographerUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline decoration-bk-line underline-offset-2"
      >
        {photo.photographer}
      </a>{" "}
      ຜ່ານ{" "}
      <a
        href={photo.sourceUrl || "https://www.pexels.com"}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline decoration-bk-line underline-offset-2"
      >
        Pexels
      </a>
    </p>
  )
}
