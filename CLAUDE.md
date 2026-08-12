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

The Sanity Studio is NOT embedded as a route here — `sanity.config.ts` + schemas under `sanity/schemas/` define the content model. There is no `studioHost` in `sanity.cli.ts`, so there is no permanently-hosted Studio URL (studio.laoforextrader.com is not deployed — it 404s). To edit content, run `npx sanity dev` → http://localhost:3333 (projectId/dataset are hardcoded in `sanity.config.ts`, so local Studio edits land on the live `production` dataset). To publish a permanent hosted Studio, run `npx sanity deploy` and pick a host (→ `<host>.sanity.studio`).

## Architecture — three pipelines that share Sanity

Most code paths fall into one of three time-driven pipelines. Understanding which pipeline you are in usually tells you which timezone, secret, and Sanity doc type matters.

### 1. Daily news pipeline (Vercel cron)

`vercel.json` schedules ONE cron at `0 23 * * *` UTC (= 06:00 ICT) → `app/api/cron/daily-update/route.ts`.

Fetches economic calendar + forex RSS → summarizes via Anthropic SDK (`lib/news/summarize.ts`) → writes a `dailyUpdate` Sanity doc (one per `YYYY-MM-DD`) → optionally pushes a short LINE message.

**Hard constraint:** Vercel Hobby gives `maxDuration = 60s` for this route. The pipeline lives inside that budget; don't add blocking I/O without measuring. Vercel Hobby also caps the project at 1 cron/day — that slot is taken. All other recurring work must use external schedulers.

The budget is genuinely tight — the two-stage Claude call measures ~43s, leaving ~15s of headroom. When it overruns, Vercel hard-kills the invocation and the route's own `catch` never runs, so **the failure mode is a totally missing doc, not an error doc**. Two defences:

- **The Sanity write is split in two.** Stage 1 patches `rawCalendar` + `rawNews` (cheap, <1s to fetch) and sets `pipelineComplete: false` *before* calling Claude; stage 2 layers the Lao summary on and flips `pipelineComplete: true`. A Claude timeout therefore degrades to "calendar table renders, summary missing" rather than "yesterday's news". Both stages use `createIfNotExists` + `patch`, never `createOrReplace` — replacing would wipe stage 1's work (the error path included).
- **A cron-job.org safety net re-hits the route ~2h after the Vercel cron.** The route no-ops when `pipelineComplete` is already true, so the retry costs one Sanity read and can't double-push LINE. `?force=true` bypasses the guard for manual regeneration.

`/news` reads `latestDailyUpdate` = `order(date desc)[0]` with no date check, so a missing day silently shows the previous one — that's why the doc must exist even on a partial run.

**LINE push gate:** `hasVeryHighImpact()` in `lib/news/summarize.ts`, deliberately stricter than `hasHighImpact`. Requires all three: `country === "US"`, `impact === "high"`, and a `TIER1_EVENT_RE` match (NFP · CPI · FOMC · Fed funds · rate decision · core PCE). Keeps pushes to ~4–5/month against the 500-msg quota. `lineSentAt` records a successful push.

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

### EA presentation & CTA surface (reads pipeline-3 data)

Separate from ingestion: the public-facing EA marketing layer. All of it degrades gracefully — if `eaStats` is missing/`off`, components fall back to hardcoded placeholder percentages (so a not-yet-live EA still renders).

- **`/ea-system`** composes one `components/sections/EAShowcaseSection.tsx` per EA. It's a reusable server component keyed by props: `variant` (`galaxy`/`hyperspace`/`aurora` background canvas), `theme` (`blue`/`purple`/`emerald`), `mirror` (swap text/stat-card sides), `comingSoon` (hide live numbers), and `links` (when set, renders Copy-Trade/Download/Backtest buttons instead of the default LINE button). Each canvas lives in `components/ui/*Canvas.tsx`.
- **Backtest pages** (e.g. `/ea-system/abs-backtest`) are static, with images in `public/EA_backtest/`. `components/ea/BacktestGallery.tsx` is the client lightbox (the page itself stays a server component).
- **Inline article CTAs:** `components/cta/CTASelector.tsx` maps a `type` string (`ea-sgride`/`ea-megihgedge`/`ea-abs`/`broker-*`) to `EaCTA`/`BrokerCTA`. `EaCTA` themes by EA name.
- **`EAStatsCard.tsx`** is the detailed live card at `/ea/[id]`.

**Adding a new EA touches ~6 places** (keep them in sync): create the `eaStats` Studio doc · add an `EAShowcaseSection` to `/ea-system` · the `ea-*` union in `types/index.ts` · the option list in `sanity/schemas/article.ts` · a branch in `CTASelector.tsx` (+ theme in `EaCTA.tsx`) · a `mql/EAStatsReporter_<EA>.set` preset whose `EAID` matches the doc's `eaId`.

## Sanity content model

Schemas in `sanity/schemas/index.ts`:
- `article`, `author`, `comment`, `like` — blog + engagement (likes/comments are NextAuth-gated, written via `lib/sanityWrite.ts`)
- `broker` — `/broker/[slug]` pages
- `quiz` — interactive quizzes (`/quiz/[slug]`)
- `eaStats` — one doc per EA id (`sgride`, `megihedge`, `abs`); patched only by `/api/ea/stats`. The doc must be **created in Studio first** — the webhook 404s on an unknown `eaId` (it never auto-creates).
- `broadcastSchedule` — drives pipeline 2
- `dailyUpdate` — output of pipeline 1, read by `/news/*`
- `subscriber` — newsletter membership; emails captured at signup persist for future broadcasts
- `chatQuota` — one doc per `(key, day)` where key = `u:<userId>` or `ip:<ip>`. Patched by `/api/chat` per turn. Cap: guest 10/day, user 30/day, pro 1000/day.
- `chatSession` — one doc per `(userId, day)` for logged-in users. Appends `{role, content, createdAt}` per turn.
- `supportThread` — one doc per chat `threadId` (browser UUID). Holds the two-way admin live-chat transcript (`messages[]` of `{role: user|admin}`) + `telegramMsgIds[]` for reply routing. Written by `/api/chat/contact-admin` (visitor) and `/api/telegram/webhook` (admin), read by `/api/chat/thread` (widget polling).

## AI chat (TheRocket AI)

Floating widget on every page. `app/api/chat/route.ts` streams Claude Haiku 4.5 over SSE with `cache_control: ephemeral` on the system prompt (`lib/chat/systemPrompt.ts`) — cuts input cost ~90% within the 5-min cache window. Lao-language guardrails live in the system prompt itself. Quota + session save are best-effort (fail-open on Sanity outage).

The widget (`components/chat/ChatWidget.tsx`) is lazy-loaded via `ChatWidgetLoader.tsx` so it doesn't appear in initial bundle. Mascot is the custom Chibi `RobotIcon.tsx` (sparkle eyes + blush). Web Audio synth in `sounds.ts` plays pop/boop/click — gated by a header toggle, persisted in `localStorage`. Conversation is mirrored to `localStorage` for guest continuity and to `chatSession` Sanity doc for logged-in history. To change tone/scope/pricing answers, edit the system prompt only — keep it byte-stable to maximize cache hits.

**Admin handoff — two-way live chat over Telegram.** The empty state has a "ສົ່ງຂໍ້ຄວາມຫາ admin" button that switches the widget to `mode="admin"`. The visitor gets a stable `threadId` (UUID in localStorage, key `trs-chat-thread-v1`) shared by guests and logged-in users. The round trip:

1. **Visitor → admin:** `/api/chat/contact-admin` upserts a `supportThread` doc (`_id = supportThread.<threadId>`), appends a `{role:"user"}` message, and pushes a Telegram notice to `ADMIN_TELEGRAM_CHAT_ID`. It stores the Telegram `message_id` in the thread's `telegramMsgIds[]` for reply routing.
2. **Admin → visitor:** the admin **replies (in Telegram) to that notice**. Telegram delivers it to `/api/telegram/webhook` (verified via `X-Telegram-Bot-Api-Secret-Token` == `TELEGRAM_WEBHOOK_SECRET`), which matches `reply_to_message.message_id` against `telegramMsgIds`, finds the thread, and appends a `{role:"admin"}` message.
3. **Delivery:** the widget polls `/api/chat/thread?threadId=…&after=<ISO>` every 3s (whenever the panel is open and the visitor has engaged admin) and renders new admin messages as `role:"admin"` bubbles.

Register the inbound webhook once with `node scripts/set-telegram-webhook.mjs` (reads `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `PUBLIC_BASE_URL`). The legacy `adminMessage` doc type is still in the schema but is no longer the live path. There is no Vercel cron involved — the webhook is event-driven, so it doesn't touch the 1-cron limit.

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
