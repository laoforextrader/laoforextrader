import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ | LaoForexTrader",
}

const SECTIONS = [
  {
    title: "1. ຂໍ້ມູນທີ່ເກັບກຳ",
    body:  "ພວກເຮົາເກັບກຳຂໍ້ມູນການໃຊ້ງານ ເຊັ່ນ: ໜ້າທີ່ທ່ານເຂົ້າຊົມ, ເວລາທີ່ໃຊ້ ແລະ ຂໍ້ມູນ Browser ເພື່ອປັບປຸງປະສົບການ.",
  },
  {
    title: "2. ການໃຊ້ຂໍ້ມູນ",
    body:  "ຂໍ້ມູນຂອງທ່ານຈະຖືກໃຊ້ເພື່ອປັບປຸງເວັບໄຊທ໌, ສົ່ງຂ່າວສານ ແລະ ໃຫ້ບໍລິການທີ່ດີຂຶ້ນ. ພວກເຮົາບໍ່ຂາຍຂໍ້ມູນຂອງທ່ານໃຫ້ບຸກຄົນທີສາມ.",
  },
  {
    title: "3. Cookies",
    body:  "ເວັບໄຊທ໌ນີ້ໃຊ້ Cookies ເພື່ອບັນທຶກ Session ແລະ ການຕັ້ງຄ່າ. ທ່ານສາມາດປິດ Cookies ໄດ້ຈາກ Browser Settings.",
  },
  {
    title: "4. ຄວາມປອດໄພ",
    body:  "ພວກເຮົາໃຊ້ HTTPS ແລະ ມາດຕະການຄວາມປອດໄພທີ່ທັນສະໄໝ ເພື່ອຮັກສາຂໍ້ມູນຂອງທ່ານ.",
  },
  {
    title: "5. ຕິດຕໍ່",
    body:  "ຫາກທ່ານມີຄຳຖາມ ກ່ຽວກັບນະໂຍບາຍນີ້ ກະລຸນາຕິດຕໍ່ທີ່ laoforextrader@gmail.com",
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E6F0", padding: "48px 52px" }}>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>
            Policy
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            ນະໂຍບາຍ
            <br />
            <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ຄວາມເປັນສ່ວນຕົວ
            </span>
          </h1>

          <div style={{ width: 40, height: 2, background: "#111827", marginBottom: 36 }} />

          {SECTIONS.map(s => (
            <div key={s.title} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.85, fontFamily: "'Noto Sans Lao', sans-serif" }}>{s.body}</p>
            </div>
          ))}

          <div style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid #F3F4F6", fontSize: 11, color: "#9CA3AF" }}>
            ອັບເດດຫຼ້າສຸດ: ມັງກອນ 2026
          </div>

        </div>
      </div>
    </div>
  )
}
