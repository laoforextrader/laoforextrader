// Who may open /admin.
//
// Driven by the ADMIN_EMAILS env var (comma-separated) so access can change
// without a deploy. The fallback is the site's own contact address, which is
// already public in /contact — keeping it here means /admin works on a fresh
// environment before the env var is set, and never means "open to everyone".

const FALLBACK_ADMINS = ["laoforextrader@gmail.com"]

export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS
  const list = (raw ? raw.split(",") : FALLBACK_ADMINS)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.length ? list : FALLBACK_ADMINS
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}
