# GoKwon Presentation Repository

This is a public presentation copy of the GoKwon project.

GoKwon is a mobile-first concierge ordering service for foreign travelers in Korea. It focuses on:

- Local K-food ordering
- Custom requests through a Korean buddy flow
- Multilingual UI for English, Chinese, and Japanese users
- Mobile-first menu browsing and checkout UX

## Security Notice

This repository is sanitized for public project review.

The following production-only parts were intentionally removed or stubbed:

- Payment capture server logic
- Admin API routes
- Email notification server logic
- Supabase service-role client implementation
- Supabase database migrations and production schema
- Local environment files and deployment credentials

No real API keys, service-role keys, payment secrets, or production env files are included.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- next-intl
- Supabase client integration
- PayPal UI integration, with production server capture logic removed

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` if you want to run external integrations locally.
