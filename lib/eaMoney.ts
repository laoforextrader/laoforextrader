// Money handling shared by the public EA cards and the LINE broadcast
// captions. Both read the same `eaStats` doc, so both need the same rules.
//
// CENT ACCOUNTS. Some brokers run "cent accounts" where ACCOUNT_CURRENCY is
// USC / CNT / EUC and every money figure — balance, equity, deposits,
// profit — is denominated in cents. MT5 reports those raw and
// mql/EAStatsReporter.mq5 passes them through untouched, so anything that
// prints a money value has to divide by 100 first. SGride is one of these
// (account 20217728, CNT): its real $6,345.06 balance arrives as
// 634505.67, and the public card used to render that as "$634,505.67".
//
// Percentages are unaffected — they're ratios of two cent figures, so the
// factor cancels out.

const CENT_CURRENCIES: Record<string, string> = {
  USC: "USD",
  CNT: "USD",
  EUC: "EUR",
}

const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
}

export interface Money {
  amount: number
  currency: string
}

export function isCentAccount(currency?: string | null): boolean {
  return !!currency && currency in CENT_CURRENCIES
}

/** The currency a cent account's figures are really denominated in. */
export function realCurrency(currency?: string | null): string {
  const code = currency || "USD"
  return CENT_CURRENCIES[code] ?? code
}

/** Convert a raw figure from the EA into the account's real currency. */
export function toRealMoney(amount: number, currency?: string | null): Money {
  const code = currency || "USD"
  const real = CENT_CURRENCIES[code]
  return real ? { amount: amount / 100, currency: real } : { amount, currency: code }
}

function group(amount: number, digits = 2): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** "$6,345.06" — for balances and other figures that aren't gains. */
export function fmtMoneyPlain(amount: number, currency: string, digits = 2): string {
  const symbol = SYMBOLS[currency] ?? ""
  const body = group(Math.abs(amount), digits)
  const sign = amount < 0 ? "-" : ""
  return symbol ? `${sign}${symbol}${body}` : `${sign}${body} ${currency}`
}

/** "+$493.80" / "-$12.00" — for gains, where the sign carries meaning. */
export function fmtMoney(amount: number, currency: string, digits = 2): string {
  const symbol = SYMBOLS[currency] ?? ""
  const sign = amount >= 0 ? "+" : "-"
  const body = group(Math.abs(amount), digits)
  return symbol ? `${sign}${symbol}${body}` : `${sign}${body} ${currency}`
}

/**
 * The capital base every profitPct in the doc is measured against.
 *
 * BuildPayload() in mql/EAStatsReporter.mq5 computes every percentage as
 * `profit / startBal * 100`, where startBal is lifetime deposits (falling
 * back to the current balance when the EA sees no deposit deals). So a
 * monthly "+24.69%" means "this month's profit equals 24.69% of deposited
 * capital" — NOT "the account grew 24.69% this month". Anything that
 * publishes these numbers should say so, which is what this feeds.
 */
export function capitalBase(stats: {
  startBalance?: number | null
  totalDeposits?: number | null
  currency?: string | null
}): Money | null {
  const raw = stats.startBalance ?? stats.totalDeposits
  if (!raw || raw <= 0) return null
  return toRealMoney(raw, stats.currency)
}
