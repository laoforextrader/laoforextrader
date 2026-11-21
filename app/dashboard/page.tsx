import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin/auth"
import { getEmailOptIn, getProfile } from "@/lib/subscribers"
import ProfileForm from "@/components/account/ProfileForm"
import { TERMS_VERSION } from "@/lib/terms"
import { accountOverview } from "@/lib/account/overview"
import { CopyEmail, SignOutButton } from "@/components/account/AccountActions"
import { EmailOptInCard } from "@/components/newsletter/EmailOptInCard"
import { Bookmark, Clock, MessageSquare, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "ໜ້າສ່ວນຕົວ LaoForexTrader — ບົດຄວາມທີ່ບັນທຶກໄວ້, ຄຳເຫັນຂອງທ່ານ ແລະ ການອັບເດດ.",
  alternates: { canonical: "https://www.laoforextrader.com/dashboard" },
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const user = session.user
  const isAdmin = isAdminEmail(user?.email)
  const optIn = user?.email ? await getEmailOptIn(user.email) : false
  //  The same record the EA download gate reads. Filling it in here is what
  //  opens the links over there, so the form lives at the top of the page
  //  until it is done and folds away to one line afterwards.
  const profile = user?.email ? await getProfile(user.email) : null
  //  What this person actually owns: their contest entry, their linked EA
  //  accounts, and what they have left on the site.
  const mine = user?.email
    ? await accountOverview(user.email, (user as any).id)
    : null

  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>

        {/* Profile */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {user?.image
            ? <Image src={user.image} alt={user.name ?? ""} width={52} height={52} style={{ borderRadius: "50%", border: "2px solid var(--accent-line)" }} />
            : <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-soft)", border: "2px solid var(--accent-line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--accent)", fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
          }
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 2 }}>{user?.name}</h1>
            <CopyEmail email={user?.email ?? ""} />
            <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", color: "var(--accent)", borderRadius: 4, letterSpacing: "0.06em" }}>
              FREE MEMBER
            </span>
          </div>
        </div>

        {/* Member profile — the EA download gate reads this */}
        <div style={{ marginBottom: 20 }}>
          <ProfileForm
            initialName={profile?.name || (user?.name ?? "")}
            initialPhone={profile?.phone ?? ""}
            initialAvatarId={profile?.avatarId ?? ""}
            initialAvatarUrl={profile?.avatarUrl ?? ""}
            termsVer={TERMS_VERSION}
            done={!!profile?.complete}
          />
        </div>

        {/* Email consent — asked for here, never assumed from a sign-in */}
        {!profile?.complete && <EmailOptInCard initialOptIn={optIn} />}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            //  Counted from this user's own rows. They used to be three
            //  hard-coded zeros, which told a member who had commented that
            //  the site had lost their comments.
            { icon: Bookmark, label: "ຖືກໃຈ", value: String(mine?.likes ?? 0) },
            { icon: MessageSquare, label: "ຄຳເຫັນ", value: String(mine?.comments ?? 0) },
            { icon: Clock, label: "ບັນຊີ EA", value: String(mine?.eaAccounts.length ?? 0) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <Icon size={16} color="var(--fg-4)" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--fg)", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* The contest, when this person is in it. The entry code lives here
            as well as on /contest/me, because this is the page they land on
            from the navbar and the code is what the EA asks for. */}
        {mine?.contest && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--accent-line)", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--fg-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                ການແຂ່ງຂັນ
              </span>
              <span style={{ fontSize: 11, color: "var(--fg-3)" }}>
                {mine.contest.roundTitle}{mine.contest.entryNo ? ` · #${mine.contest.entryNo}` : ""}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 4 }}>ລະຫັດຜູ້ແຂ່ງຂອງທ່ານ</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, letterSpacing: "0.18em", color: "var(--accent)", marginBottom: 10 }}>
              {mine.contest.code || "—"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, fontSize: 12, color: "var(--fg-3)", marginBottom: 12 }}>
              <span>ບັນຊີ MT5</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-2)" }}>{mine.contest.mtLogin || "—"}</span>
              <span>ສະຖານະ</span>
              <span style={{ color: mine.contest.status === "pending" ? "var(--fg-2)" : "var(--success)" }}>
                {mine.contest.status === "pending" ? "ລໍຖ້າ EA ເຊື່ອມຕໍ່" : mine.contest.status}
              </span>
              <span>EA ສົ່ງຂໍ້ມູນຫຼ້າສຸດ</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-2)" }}>
                {mine.contest.lastSeen ? new Date(mine.contest.lastSeen).toLocaleString() : "ຍັງບໍ່ທັນສົ່ງ"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href="/contest/me" className="btn-primary" style={{ display: "inline-flex", padding: "8px 14px", fontSize: 12.5 }}>ໃບສະໝັກຂອງຂ້ອຍ →</Link>
              <Link href="/contest/install" style={{ display: "inline-flex", alignItems: "center", padding: "8px 14px", fontSize: 12.5, fontWeight: 600, borderRadius: 10, border: "1px solid var(--line-2)", color: "var(--fg-2)", textDecoration: "none" }}>ຕິດຕັ້ງ EA</Link>
            </div>
          </div>
        )}

        {!mine?.contest && mine?.contestOpen && (
          <Link href="/contest"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--accent-line)", borderRadius: 14, padding: "14px 18px", marginBottom: 20, textDecoration: "none" }}>
            <div>
              <p style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600, marginBottom: 2 }}>ການແຂ່ງຂັນເທຣດບັນຊີເດໂມ</p>
              <p style={{ fontSize: 11, color: "var(--fg-4)" }}>ເປີດຮັບສະໝັກຢູ່ · ທ່ານຍັງບໍ່ທັນສະໝັກ</p>
            </div>
            <ChevronRight size={14} color="var(--fg-4)" />
          </Link>
        )}

        {/* MT5 accounts linked to the Semi dashboard. The key tail is here so
            somebody with two accounts can tell which key belongs to which. */}
        {!!mine?.eaAccounts.length && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--line-2)" }}>
              <span style={{ fontSize: 10, color: "var(--fg-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>ບັນຊີ EA ຂອງຂ້ອຍ</span>
            </div>
            {mine.eaAccounts.map(a => (
              <Link key={a.account} href={`/semi?account=${encodeURIComponent(a.account)}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--line-2)", textDecoration: "none" }}>
                <div>
                  <p style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>{a.account}</p>
                  <p style={{ fontSize: 11, color: "var(--fg-4)" }}>
                    {a.lastSeen ? `ເຫັນ EA ຫຼ້າສຸດ ${new Date(a.lastSeen).toLocaleString()}` : "ຍັງບໍ່ທັນເຫັນ EA"}
                    {a.keyTail ? ` · key …${a.keyTail}` : ""}
                  </p>
                </div>
                <ChevronRight size={14} color="var(--fg-4)" />
              </Link>
            ))}
          </div>
        )}

        {/* Menu */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: 10, color: "var(--fg-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>ຄຸນສົມບັດ</span>
          </div>
          {[
            { label: "ບົດຮຽນ Forex 50 ບົດ",   desc: "ຮຽນຕໍ່ຈາກທີ່ຄ້າງ",     href: "/lessons" },
            { label: "ລີວິວ Broker",          desc: "ເບິ່ງ Broker ທັງໝົດ",    href: "/broker" },
            { label: "Pip Calculator",        desc: "ຄຳນວນ Pip ແລະ Lot",      href: "/tools/pip-calculator" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--line-2)", textDecoration: "none" }}>
              <div>
                <p style={{ fontSize: 14, color: "var(--fg)", fontWeight: 500, marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "var(--fg-4)" }}>{item.desc}</p>
              </div>
              <ChevronRight size={14} color="var(--fg-4)" />
            </Link>
          ))}
        </div>

        {isAdmin && (
          <Link href="/admin"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111827", borderRadius: 14, padding: "14px 18px", marginBottom: 20, textDecoration: "none" }}>
            <div>
              <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, marginBottom: 2 }}>ພາບລວມເວັບໄຊ (Admin)</p>
              <p style={{ fontSize: 11, color: "var(--fg-4)" }}>ຍອດເບິ່ງ · EA · Broadcast · ແຊັດ · ຄລິກສະໝັກ</p>
            </div>
            <ChevronRight size={14} color="var(--fg-3)" />
          </Link>
        )}

        {/* CTA */}
        <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 16, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "var(--fg)", fontWeight: 600, marginBottom: 6 }}>
            ຍິນດີຕ້ອນຮັບ, <span style={{ color: "var(--accent)" }}>{user?.name?.split(" ")[0]}</span>!
          </p>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 16 }}>ຮຽນ 50 ບົດ ຟຣີ ກັບ LaoForexTrader</p>
          <Link href="/lessons" className="btn-primary" style={{ display: "inline-flex" }}>ເລີ່ມຮຽນ Forex →</Link>
        </div>

        <div style={{ marginTop: 20 }}>
          <SignOutButton label="ອອກຈາກລະບົບ" />
        </div>
      </div>
    </div>
  )
}
