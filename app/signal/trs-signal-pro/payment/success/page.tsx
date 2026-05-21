import type { Metadata } from "next"
import { SuccessClient } from "./SuccessClient"

export const metadata: Metadata = {
  title: "ສົ່ງສຳເລັດ · TheRocket Signal Pro",
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{
    mode?: string
    invite?: string
    plan?: string
    method?: string
    bot?: string
    id?: string
    token?: string
  }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const p = await searchParams
  return (
    <SuccessClient
      initialMode={p.mode || "pending"}
      initialInvite={p.invite ? decodeURIComponent(p.invite) : null}
      botStartUrl={p.bot ? decodeURIComponent(p.bot) : null}
      pendingId={p.id ? parseInt(p.id, 10) : null}
      publicToken={p.token || null}
    />
  )
}
