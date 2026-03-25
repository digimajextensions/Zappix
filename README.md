# Zappix

> The Operating System for WhatsApp TV Businesses
> Domain: **zappix.ng**

---

## Overview

Zappix is a production-ready SaaS platform built for Nigerian WhatsApp TV businesses. It provides tools for scheduling WhatsApp statuses, sending broadcasts, managing contacts, selling ad slots, building chatbots, and more -- all from a single premium dashboard.

**Current Status**: 95% complete (121/127 tasks done). All core features, API integrations, and backend logic are implemented. Remaining work is infrastructure deployment and end-to-end testing with live service accounts.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| API | tRPC |
| Database | Neon PostgreSQL (serverless) via Prisma 7 + Neon adapter |
| ORM | Prisma 7 |
| Cache/Queues | Upstash Redis + Inngest |
| WhatsApp Engine | Evolution API v2 (Railway) |
| Auth | Clerk |
| Payments | Paystack |
| Referral Payouts | Paystack Transfers (bank) |
| Email | Resend |
| Blog | Sanity CMS |
| Media Storage | Cloudinary |
| Frontend Hosting | Render |
| Styling | Tailwind CSS + Radix UI + Framer Motion |

---

## Features

1. **Status Scheduler** - Schedule and auto-post WhatsApp statuses with text, image, or video via Cloudinary upload and Inngest job scheduling
2. **Broadcast Engine** - Send messages to thousands with smart throttling, delivery tracking, opt-out handling, and per-recipient analytics
3. **Contact Manager** - Import via CSV, tag system, contact lists, custom fields, search, and segmentation
4. **Analytics Dashboard** - Track reach, delivery, growth, and revenue with period selectors, Recharts-ready data, CSV/PDF export
5. **Ad Slot Manager** - Create bookable ad slots with public booking page at /ads/[userId], Paystack payments, and booking management
6. **Chatbot Builder** - FAQ bots with keyword matching, automation flows with visual flow builder, and auto-responders
7. **Menu Bot** - Interactive WhatsApp menu system with tree editor, live preview, and numbered response handling
8. **Multi-Account Manager** - Manage multiple WhatsApp numbers with connection monitoring, QR reconnect, and warm-up tracking
9. **Referral System** - 25% recurring commission with signup/conversion tracking, 30-day hold, daily release cron, and bank payouts via Paystack Transfers
10. **Team Management** - Invite team members with role-based access (Admin/Editor/Viewer), email invites via Resend

---

## Pricing

| Plan | Monthly | Yearly (per month) | WhatsApp Accounts | Contacts |
|------|---------|-------------------|-------------------|----------|
| Starter | N10,000 | N8,300 | 1 | 7,500 |
| Growth | N25,000 | N20,750 | 3 | 37,500 |
| Business | N55,000 | N45,650 | 7 | 112,500 |
| Scale | N100,000 | N83,000 | 15 | 300,000 |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Accounts on: Neon, Clerk, Railway, Paystack, Resend, Sanity, Cloudinary, Upstash, Inngest

### Installation

```bash
git clone https://github.com/digimajextensions/Zappix.git
cd Zappix
npm install --legacy-peer-deps
cp .env.example .env.local
# Fill in your environment variables
```

### Database Setup

```bash
DATABASE_URL="your-neon-url" npx prisma generate
DATABASE_URL="your-neon-url" npx prisma migrate dev --name init
DATABASE_URL="your-neon-url" npx prisma db seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Deployment (Render)

The repository includes a `render.yaml` for automated Render deployment:

```yaml
buildCommand: npm ci && npx prisma generate && npm run build
startCommand: npm start
```

See [instructions.md](./instructions.md) for the full 15-step deployment guide.

---

## Project Structure

```
src/
  app/
    (marketing)/       # Landing, features, pricing, blog, legal pages
    (auth)/            # Sign-in, sign-up, onboarding pages
    app/               # Dashboard pages (protected)
    ads/[userId]/      # Public ad booking page
    api/
      inngest/         # Inngest background job handler
      trpc/            # tRPC API route
      webhooks/        # Clerk, Paystack, Evolution API webhooks
      cron/            # Cron job endpoints
  components/
    dashboard/         # Dashboard UI components (sidebar, flow builder, etc.)
    marketing/         # Marketing page components (hero, pricing, etc.)
    shared/            # Shared components (animations, logo, etc.)
    ui/                # Base UI components (button, input, modal, etc.)
  lib/                 # Utilities, Prisma client, Redis, constants
  server/
    evolution/         # Evolution API client, instance manager, webhook handler
    inngest/           # Inngest client and background job functions
    middleware/        # Plan limits and role-based access middleware
    services/          # Cloudinary, email, Paystack, Sanity services
    trpc/              # tRPC router, context, and 11 sub-routers
prisma/
  schema.prisma        # Database schema (20+ models)
  seed.ts              # Pricing plan seed data
```

---

## API Routers (tRPC)

| Router | Endpoints | Purpose |
|--------|-----------|---------|
| `user` | `me`, `updateProfile`, `usageStats` | User profile and plan usage |
| `whatsapp` | `listAccounts`, `createInstance`, `getQrCode`, `connectionStatus`, `reconnect`, `disconnect`, `deleteInstance`, `updateAccount`, `getAccount` | WhatsApp account management |
| `status` | `list`, `getById`, `create`, `update`, `delete`, `retry`, `uploadMedia` | Status scheduling with Cloudinary + Inngest |
| `broadcast` | `list`, `stats`, `analytics`, `create`, `send`, `cancel`, `optOut`, `optIn` | Broadcast management with delivery tracking |
| `contact` | `list`, `getById`, `stats`, `create`, `update`, `delete`, `importCsv`, `getLists`, `createList`, `updateList`, `deleteList`, `addToList`, `removeFromList`, `getTags`, `createTag`, `updateTag`, `deleteTag`, `assignTags`, `removeTags` | Full contact management |
| `analytics` | `overview`, `kpis`, `exportCsv`, `exportPdf` | Analytics with chart data and exports |
| `referral` | `dashboard`, `trackSignup`, `trackConversion`, `requestWithdrawal`, `withdrawalHistory` | Referral system with commission tracking |
| `adSlot` | `list`, `stats`, `create`, `update`, `delete`, `getBookings`, `approveBooking`, `rejectBooking`, `markDelivered`, `getPublicSlots`, `createBooking`, `verifyBookingPayment` | Ad slot management with public booking |
| `bot` | `getChatbotConfig`, `updateChatbotConfig`, `addFaqEntry`, `updateFaqEntry`, `deleteFaqEntry`, `createFlow`, `updateFlow`, `deleteFlow`, `getMenuBotConfig`, `updateMenuBotConfig` | Chatbot and menu bot configuration |
| `billing` | `getSubscription`, `getPlans`, `initializeCheckout`, `verifyPayment`, `cancelSubscription`, `addBankAccount`, `listBanks` | Subscription and billing management |
| `team` | `list`, `invite`, `updateRole`, `resendInvite`, `remove` | Team member management |

---

## Background Jobs (Inngest)

| Job | Trigger | Purpose |
|-----|---------|---------|
| `status/post` | Event | Post scheduled WhatsApp statuses via Evolution API |
| `broadcast/send` | Event | Send broadcasts with throttling and delivery tracking |
| `payout/process` | Event | Process bank transfer payouts via Paystack Transfers |
| `analytics-daily` | Cron (1 AM) | Aggregate daily analytics snapshots per user |
| `commissions-release` | Cron (2 AM) | Release held commissions after 30-day period |

---

## Environment Variables

See `.env.example` for the full list. Key variables:

- `DATABASE_URL` - Neon PostgreSQL pooled connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Clerk auth
- `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` - WhatsApp API
- `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` - Payments
- `RESEND_API_KEY` - Email
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` - Media
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Cache
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` - Background jobs
- `NEXT_PUBLIC_SANITY_PROJECT_ID` / `SANITY_API_TOKEN` - Blog CMS

---

## License

Proprietary. All rights reserved.
