# 🇱🇦 LaoForexTrader — Next.js Rebuild

เว็บข้อมูล Forex สำหรับคนลาว สร้างใหม่ด้วย Next.js 15 + Sanity CMS

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (Dark Gold theme)
- **CMS**: Sanity.io (บทความ + Broker)
- **Auth**: NextAuth.js (Google + Email)
- **Deploy**: Vercel (ฟรี)
- **Language**: ภาษาลาว (Noto Sans Lao)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local
# แก้ไขค่าต่างๆ ใน .env.local

# 3. Setup Sanity
npx sanity init --project your_project_id

# 4. Run dev server
npm run dev
```

## Folder Structure
```
app/                  → Next.js pages (App Router)
  broker/             → รายชื่อ + รีวิว Broker
  education/          → บทความความรู้ Forex
  news/               → ข่าวการเงิน
  analysis/           → วิเคราะห์กราฟ
  tools/              → Pip/Lot calculator
  dashboard/          → Member area
  api/                → API routes

components/           → React components
  layout/             → Navbar, Footer, Sidebar
  broker/             → BrokerCard, StarRating
  article/            → ArticleCard, CommentBox
  market/             → MarketTicker, PriceWidget

lib/                  → Utilities
  sanity.ts           → CMS client + queries
  auth.ts             → NextAuth config
  utils.ts            → Helper functions

sanity/schemas/       → CMS data schemas
  article.ts          → บทความ
  broker.ts           → Broker
  author.ts           → ผู้เขียน
```

## ขั้นตอนถัดไป
1. สร้าง Sanity project ที่ sanity.io
2. ตั้งค่า Google OAuth ที่ console.cloud.google.com
3. Deploy ขึ้น Vercel
4. นำเข้าบทความเก่าจาก WordPress
