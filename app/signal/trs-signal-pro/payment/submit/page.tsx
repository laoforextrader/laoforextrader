import type { Metadata } from "next"
import { SubmitForm } from "./SubmitForm"

export const metadata: Metadata = {
  title: "ສົ່ງສລິບ · TheRocket Signal Pro",
  description: "ສົ່ງສລິບການໂອນເງິນ ຫຼື TX Hash ເພື່ອຮັບລິ້ງ Pro Channel",
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ plan?: string }>
}

export default async function PaymentSubmitPage({ searchParams }: Props) {
  const params = await searchParams
  return <SubmitForm initialPlan={params.plan || ""} />
}
