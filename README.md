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

Scheduled work is one **daily** cron in `vercel.json` (`/api/cron/daily` at 06:00 UTC) so it stays within Vercel **Hobby** limits. That route refreshes FX rates and runs Diffy news ingest when Diffy env vars are set. For more frequent runs (e.g. hourly), upgrade to **Pro** and either change the schedule or call `/api/cron/fetch-news` and `/api/cron/fetch-fx` from additional cron entries. `CRON_SECRET` must be set.
