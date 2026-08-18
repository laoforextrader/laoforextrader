import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ຍົກເລີກຮັບອີເມວ",
  robots: { index: false, follow: false },
}

// Wording matters more than it looks: someone lands here annoyed, and the
// difference between "you're off the list" and an ambiguous page is whether
// they press the button that actually hurts — report spam.
const MESSAGES: Record<string, { icon: string; title: string; body: string }> = {
  ok: {
    icon: "✓",
    title: "ຍົກເລີກສຳເລັດແລ້ວ",
    body: "ພວກເຮົາຈະບໍ່ສົ່ງອີເມວຫາທ່ານອີກຕໍ່ໄປ. ຂອບໃຈທີ່ເຄີຍຕິດຕາມພວກເຮົາ.",
  },
  already: {
    icon: "✓",
    title: "ທ່ານຍົກເລີກໄປແລ້ວ",
    body: "ອີເມວຂອງທ່ານຖືກລຶບອອກຈາກລາຍຊື່ກ່ອນໜ້ານີ້ແລ້ວ — ບໍ່ຕ້ອງເຮັດຫຍັງເພີ່ມ.",
  },
  notfound: {
    icon: "✓",
    title: "ບໍ່ພົບອີເມວໃນລາຍຊື່",
    body: "ອີເມວນີ້ບໍ່ໄດ້ຢູ່ໃນລາຍຊື່ຮັບຂ່າວສານຂອງພວກເຮົາ — ທ່ານຈະບໍ່ໄດ້ຮັບອີເມວຈາກພວກເຮົາຢູ່ແລ້ວ.",
  },
  badtoken: {
    icon: "!",
    title: "ລິ້ງບໍ່ຖືກຕ້ອງ",
    body: "ລິ້ງຍົກເລີກນີ້ໃຊ້ບໍ່ໄດ້ ຫຼື ຖືກຕັດຂາດ. ກະລຸນາຕິດຕໍ່ພວກເຮົາ ພວກເຮົາຈະລຶບໃຫ້ດ້ວຍມື.",
  },
  error: {
    icon: "!",
    title: "ມີບັນຫາຊົ່ວຄາວ",
    body: "ລອງໃໝ່ອີກຄັ້ງ ຫຼື ຕິດຕໍ່ພວກເຮົາ — ພວກເຮົາຈະລຶບອອກໃຫ້ດ້ວຍມື.",
  },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>
}) {
  const { s } = await searchParams
  const state = MESSAGES[s ?? ""] ?? MESSAGES.badtoken
  const failed = s === "badtoken" || s === "error"

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 24px", width: "100%" }}>
        <div style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700,
              background: failed ? "#FEF3C7" : "#DCFCE7",
              color: failed ? "#B45309" : "#15803D",
            }}
          >
            {state.icon}
          </div>
          <h1 className="font-lao" style={{ fontSize: 19, fontWeight: 700, color: "#111827", marginBottom: 10 }}>
            {state.title}
          </h1>
          <p className="font-lao" style={{ fontSize: 13, lineHeight: 1.8, color: "#6B7280", marginBottom: 24 }}>
            {state.body}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="font-lao" style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#2563EB", padding: "10px 18px", borderRadius: 10 }}>
              ກັບໜ້າຫຼັກ
            </Link>
            <Link href="/contact" className="font-lao" style={{ fontSize: 12, fontWeight: 600, color: "#374151", background: "#F3F4F6", padding: "10px 18px", borderRadius: 10 }}>
              ຕິດຕໍ່ພວກເຮົາ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
