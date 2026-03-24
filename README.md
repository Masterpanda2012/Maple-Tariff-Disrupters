# Maple Tariff Disruptors

Trade-aware intelligence and a marketplace for businesses and shoppers — economic briefings, supplier context, and clear next steps.

## Development

Copy `.env.example` to `.env`, set required variables (PostgreSQL `DATABASE_URL`, `NEXTAUTH_SECRET`, and optional API keys), then:

```bash
npm install
npm run db:migrate
npm run dev
```

Run tests with `npm test`; lint with `npm run lint`.

## Deploy on Vercel

1. Create a **PostgreSQL** database (e.g. [Neon](https://neon.tech)) and copy the connection string.
2. In the Vercel project → **Settings → Environment Variables**, add at least:
   - `DATABASE_URL` — Postgres URL (with `sslmode=require` if your host requires it)
   - `NEXTAUTH_SECRET` — long random string (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` — your production URL, e.g. `https://your-app.vercel.app`
   - `CRON_SECRET` — random string; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` to `/api/cron/*`
   - Optional: `OPENAI_API_KEY`, `DIFFY_API_URL`, `DIFFY_API_KEY` for AI reports and news ingestion
3. Redeploy. The build runs `prisma migrate deploy` then `next build`, so the database schema is applied automatically when `DATABASE_URL` is set.

Scheduled jobs are defined in `vercel.json` (news hourly, FX at :15 past the hour). They require `CRON_SECRET` to be set.
