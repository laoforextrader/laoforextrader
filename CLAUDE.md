# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**laoforextrader.com** — Lao-language forex info site. Next.js 15 App Router + Sanity CMS + LINE OA broadcasts + live MT5 EA stats ingestion.

Solo-developer repo: push to `main` and Vercel auto-deploys. No PR workflow.

## Commands

```bash
npm run dev          # next dev --turbopack
npm run build        # prerenders OG images via puppeteer THEN next build
npm run lint         # next lint
npm run prerender-og # regenerate /public OG PNGs only
```

No test runner is configured. `npm run build` is the canonical correctness check.

The Sanity Studio is hosted by Sanity (not embedded as a route here) — `sanity.config.ts` + schemas under `sanity/schemas/` define the content model. Deploy Studio with the `sanity` CLI from `devDependencies` if schema changes need to ship to studio.laoforextrader.com.

## Architecture — three pipelines that share Sanity

Most code paths fall into one of three time-driven pipelines. Understanding which pipeline you are in usually tells you which timezone, secret, and Sanity doc type matters.

### 1. Daily news pipeline (Vercel cron)

`vercel.json` schedules ONE cron at `0 23 * * *` UTC (= 06:00 ICT) → `app/api/cron/daily-update/route.ts`.

Fetches economic calendar + forex RSS → summarizes via Anthropic SDK (`lib/news/summarize.ts`) → writes a `dailyUpdate` Sanity doc (one per `YYYY-MM-DD`) → optionally pushes a short LINE message.

**Hard constraint:** Vercel Hobby gives `maxDuration = 60s` for this route. The pipeline lives inside that budget; don't add blocking I/O without measuring. Vercel Hobby also caps the project at 1 cron/day — that slot is taken. All other recurring work must use external schedulers.

### 2. LINE broadcast pipeline (external cron + Sanity-driven schedules)

External scheduler **cron-job.org** (Asia/Bangkok TZ) hits `/api/cron/broadcast` hourly → `lib/broadcast/dispatcher.ts` lists `broadcastSchedule` docs from Sanity, evaluates each via `shouldFire()`, and dispatches the due ones.

Schedule docs hold `period` (daily/weekly/monthly), `hour`, `dayOfWeek`, `dayOfMonth`, all interpreted in **Asia/Bangkok** (UTC+7, no DST — same as Asia/Vientiane). The matcher uses `Intl.DateTimeFormat` with `timeZone: "Asia/Bangkok"` so cron-job.org's timezone setting must match.

Dispatcher has a **50-minute idempotency window** (`IDEMPOTENCY_WINDOW_MIN`) so a missed/retried hourly call won't double-fire. `markBroadcastRun()` writes `lastRunAt` + `lastStatus` back to the schedule doc.

`runEaSummaryBroadcast({period})` in `lib/broadcast/eaSummary.ts` is the only template currently wired. It:
- Reads `eaStats` for `sgride` + `megihedge` from Sanity
- For `monthly` only: renders two 1080×1080 JPEG cards via Puppeteer + Chromium (`lib/broadcast/render.ts`) and uploads to Sanity assets
- Builds a Lao caption (`buildText`)
- Sends to LINE OA via `lib/broadcast/line.ts` — daily/weekly are text-only, monthly is `[image, image, text]`

### 3. EA stats ingestion (MT5 → webhook → Sanity → site)

`mql/EAStatsReporter.mq5` is the MetaTrader 5 EA the user attaches to a chart. It POSTs JSON to `/api/ea/stats` every `IntervalMin` minutes (default 60).

`app/api/ea/stats/route.ts` validates `EA_WEBHOOK_SECRET`, looks up the `eaStats` doc by `eaId`, and patches it. Three update modes: `off` (reject), `daily` (throttle to 60 min between writes), `realtime` (always accept).

**Gain% is balance-derived, not deal-sum.** The current MQL computes:
```
profitTotal    = balance + totalWithdrawals − totalDeposits
profitTotalPct = profitTotal / totalDeposits × 100
```
`CollectStats()` tallies `DEAL_TYPE_BALANCE` + `DEAL_TYPE_CREDIT` + `DEAL_TYPE_BONUS` for cash flow. Older versions summed every `DEAL_TYPE_BUY/SELL` deal — that inflated the % on shared accounts because it didn't separate EAs from manual trades. If a number looks off, suspect a missing deal type (e.g. broker uses `DEAL_TYPE_CORRECTION`) before suspecting the formula.

**Memory model: persistent buckets + one-time bootstrap + file persistence.** The expensive operation is `HistoryDealGet*` on bootstrap — touching every deal forces MT5 to load it into the terminal's process-wide deal cache, which it never frees. On a high-volume account that's 1+ GB resident. No MQL API releases that cache.

So bootstrap runs exactly ONCE per fresh install:

- File-scope sparse maps `g_dayKeys[]/g_dayProfit[]` and `g_monthKeys[]/g_monthProfit[]` keep one entry per calendar day / month, plus `g_cashedDeposits` / `g_cashedWithdrawals` counters.
- `Bootstrap()` walks history BACKWARDS in `BootstrapChunkDays` chunks (default 7d), stops after 20 empty chunks or 5-year floor. Spike is one-time.
- `SaveState()` writes everything to `MQL5/Files/EAStatsReporter_<EAID>.dat` after every send. `LoadState()` runs in `OnInit` — if present and the account login + EAID match, `g_bootstrapped = true` and bootstrap is skipped.
- After restart, `Incremental()` is the only history I/O: `HistorySelect(g_maxDealTimeSeen + 1, now + 1)` — typically minutes of deals, so MT5's deal cache stays near the empty-terminal baseline.
- Account/EAID mismatch in the loaded file → `ResetState()` → fresh bootstrap.

**User workflow on first ship:** compile → attach → accept the 1 GB peak ONCE → restart MT5 → RAM returns to ~baseline forever after.

**MT5 day boundary ≠ Bangkok day boundary.** The MQL uses broker-server time (typically GMT+3 = ICT−4), so the "today" window in `dailyReturns` runs ~04:00 ICT → 04:00 ICT. A 21:00 ICT LINE broadcast shows a *running* day, not a closed one.

## Sanity content model

Schemas in `sanity/schemas/index.ts`:
- `article`, `author`, `comment`, `like` — blog + engagement (likes/comments are NextAuth-gated, written via `lib/sanityWrite.ts`)
- `broker` — `/broker/[slug]` pages
- `quiz` — interactive quizzes (`/quiz/[slug]`)
- `eaStats` — one doc per EA id (`sgride`, `megihedge`); patched only by `/api/ea/stats`
- `broadcastSchedule` — drives pipeline 2
- `dailyUpdate` — output of pipeline 1, read by `/news/*`
- `subscriber` — newsletter membership; emails captured at signup persist for future broadcasts
- `chatQuota` — one doc per `(key, day)` where key = `u:<userId>` or `ip:<ip>`. Patched by `/api/chat` per turn. Cap: guest 10/day, user 30/day, pro 1000/day.
- `chatSession` — one doc per `(userId, day)` for logged-in users. Appends `{role, content, createdAt}` per turn.

## AI chat (TheRocket AI)

Floating widget on every page. `app/api/chat/route.ts` streams Claude Haiku 4.5 over SSE with `cache_control: ephemeral` on the system prompt (`lib/chat/systemPrompt.ts`) — cuts input cost ~90% within the 5-min cache window. Lao-language guardrails live in the system prompt itself. Quota + session save are best-effort (fail-open on Sanity outage).

The widget (`components/chat/ChatWidget.tsx`) is lazy-loaded via `ChatWidgetLoader.tsx` so it doesn't appear in initial bundle. Mascot is the custom Chibi `RobotIcon.tsx` (sparkle eyes + blush). Web Audio synth in `sounds.ts` plays pop/boop/click — gated by a header toggle, persisted in `localStorage`. Conversation is mirrored to `localStorage` for guest continuity and to `chatSession` Sanity doc for logged-in history. To change tone/scope/pricing answers, edit the system prompt only — keep it byte-stable to maximize cache hits.

**Admin handoff:** the empty state has a "ສົ່ງຂໍ້ຄວາມຫາ admin" button that switches the widget to `mode="admin"`. Send routes to `/api/chat/contact-admin`, which saves the message to Sanity `adminMessage` (status `pending`) and best-effort pushes a Telegram alert to `ADMIN_TELEGRAM_CHAT_ID` if set. After submit, a confirmation card offers deep links to LINE (`NEXT_PUBLIC_TRS_ADMIN_LINE`) and Telegram (`NEXT_PUBLIC_TRS_ADMIN`) — admin replies in whichever channel they prefer.

`lib/sanity.ts` (read client) exports `QUERIES` — prefer adding queries there over inline GROQ. `lib/sanityWrite.ts` is the authenticated client for mutations.

## Auth

NextAuth (`lib/auth.ts`) with Google + Facebook OAuth. Sessions back likes/comments. Provider split into a separate `providers/` boundary so the rest of the app tree doesn't re-render on auth state changes.

## OG images

Pre-rendered at **build time** by `scripts/prerender-og-images.mjs` using `puppeteer-core` + `@sparticuz/chromium`, written into `/public`. Runtime chromium routes were removed because Vercel cold starts blew the function size budget. `next.config.ts` lists chromium + puppeteer under `serverExternalPackages` so they aren't bundled.

If `npm run build` fails on chromium download, it's the prerender step — investigate `scripts/prerender-og-images.mjs` before `next build`.

## Environment

`.env.local.example` documents the full set. The critical ones across pipelines:

| Var | Used by |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` | All Sanity clients (defaults: `f8cr9afb` / `production`) |
| `SANITY_API_TOKEN` | Any write path (EA webhook, broadcast asset upload, daily-update) |
| `EA_WEBHOOK_SECRET` | `/api/ea/stats` shared secret with MT5 EA |
| `CRON_SECRET` | `/api/cron/*` bearer auth (Vercel sends it automatically; manual hits must include it) |
| `BROADCAST_SECRET` | Accepted as alias of `CRON_SECRET` on the daily-update route |
| `ANTHROPIC_API_KEY` | News summarization |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE OA push |
| `GOOGLE_CLIENT_ID/_SECRET`, `FACEBOOK_CLIENT_ID/_SECRET`, `NEXTAUTH_SECRET` | NextAuth |

## Working in this repo

- **Don't add Vercel crons.** Slot is taken; use cron-job.org and add a `broadcastSchedule` doc instead. The dispatcher generalizes — a new schedule + new template function is enough for a new recurring LINE flow.
- **Time zones lie quietly.** When a "schedule fired at the wrong time" comes up, check three places: cron-job.org TZ setting, the Bangkok-formatted matcher in `dispatcher.ts`, and (for EA data) the broker server clock — they often disagree.
- **MQL changes need a manual recompile on the user's MT5.** Editing `mql/EAStatsReporter.mq5` won't take effect until the user opens MetaEditor → F7 → re-attaches the EA. Always mention this when shipping MQL changes.
- **Build runs prerender first.** Long iteration loops that only need `next build` can shave time by running it directly, but anything touching OG layout must go through the full `npm run build`.
