# Maple Tariff Disruptors

Trade-aware intelligence and a marketplace for businesses and shoppers — economic briefings, supplier context, and clear next steps.

## Development

Copy `.env.example` to `.env`, set required variables (`DATABASE_URL`, `AUTH_SECRET` or `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`), add LLM keys for reports if you need them, then:

```bash
npm install
npm run db:migrate
npm run dev
```

Run tests with `npm test`; lint with `npm run lint`.

### News (Diffy) — local and Vercel

- **Built-in feed:** `GET /api/integrations/diffy-feed` with `Authorization: Bearer <DIFFY_API_KEY>`.
- **Local:** Set **`DIFFY_API_KEY`** and **`DIFFY_API_URL=http://localhost:3000/api/integrations/diffy-feed`** (or your dev port) in `.env`. Restart `npm run dev`.
- **Vercel (primary):** Set **`DIFFY_API_KEY`** to the same secret. You can **omit `DIFFY_API_URL`** if **`NEXT_PUBLIC_APP_URL`** is your real site URL — the app appends `/api/integrations/diffy-feed` automatically when `VERCEL=1`. Optionally set `DIFFY_API_URL` explicitly or point it at an external pipeline later.
- **Trigger ingest:** Signed-in **business** → **Refresh intelligence** (`POST /api/business/refresh`), or wait for **`/api/cron/daily`** (needs **`CRON_SECRET`** on Vercel).

### Google sign-in / sign-up

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create **OAuth 2.0 Client ID** (Web application).
2. Add **Authorized JavaScript origins**: your `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000` and your production URL).
3. Add **Authorized redirect URI** exactly: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google` (e.g. `http://localhost:3000/api/auth/callback/google`).
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. The login and register pages show **Continue with Google** when both are set.
5. New Google users are stored like email users; on **Register**, the selected **Business** or **Customer** tab is applied via a short-lived cookie. Existing Google users keep their saved role.

**Env validation:** If `/api/auth/*` returns 500 with `Invalid environment variables`, fix or remove mistaken Vercel values—especially **`NEXTAUTH_URL` / `AUTH_URL`** (must be a full URL with `https://`, or leave unset), **`NEXT_PUBLIC_APP_URL`** (no stray spaces), optional **`DIFFY_API_URL` / `OLLAMA_BASE_URL` / `OPENROUTER_HTTP_REFERER`**, or a typo in **`LLM_PROVIDER`**.

**Stable URL (important on Vercel):** Google only allows **exact** origins and redirect URIs—no wildcards. Each **preview** deployment gets its own hostname (`…-git-branch-….vercel.app`), which changes and is impractical to register one-by-one. **Use one canonical URL everywhere:** set `NEXT_PUBLIC_APP_URL` to your **production** domain from Vercel **Project → Settings → Domains** (or a custom domain you attach there), and add **that same host** in Google Cloud. Test **Continue with Google** on that production URL, not on random preview links. If you need Google on previews too, enable **Preview** for `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in Vercel and register **each** preview origin and `{origin}/api/auth/callback/google` in Google Cloud (or accept Google only on production).

## Deploy on Vercel

Use **Node 22.x** locally and on Vercel (`package.json` `engines`, plus `.nvmrc`). Prisma 7’s **preinstall** rejects Node **20.10–20.18** (common old defaults); that was the usual cause of `npm install` exiting with 1. On Vercel: **Settings → General → Node.js Version → 22.x** (or leave **Automatic** so `engines` / `.nvmrc` apply). `prisma generate` runs during **`npm run build`**, not during install.

If the log shows **Installing dependencies… added N packages** with no error, install succeeded. The next lines are **`[build] prisma generate`** then **`prisma migrate deploy`** (only if `DATABASE_URL` is set). If the build fails after that, scroll to the **first red error**—often missing `DATABASE_URL`, migration errors, or Next/env validation.

1. Create a **PostgreSQL** database (e.g. [Neon](https://neon.tech)) and copy the connection string.
2. In the Vercel project → **Settings → Environment Variables**, add at least:
   - `DATABASE_URL` — Postgres URL (with `sslmode=require` if your host requires it)
   - `AUTH_SECRET` or `NEXTAUTH_SECRET` — long random string (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` — your **stable** production URL from **Domains** (e.g. `https://your-app.vercel.app`), not a one-off deployment URL from a build log. Used as `AUTH_URL` for OAuth when `AUTH_URL` is unset; must match Google’s authorized origin and redirect.
   - `CRON_SECRET` — random string; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` to `/api/cron/*`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — enable **Continue with Google** on `/login` and `/register` (redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`). If the button is missing on **preview** deploys, edit each variable and ensure **Preview** is checked, not only **Production**.
   - Optional: LLM for business reports — set **at least one** of `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, or `OLLAMA_API_KEY` (Ollama Cloud). Use optional `LLM_PROVIDER` to pick `openai` | `groq` | `openrouter` | `gemini` | `ollama`. Local Ollama: `LLM_PROVIDER=ollama`, no `OLLAMA_API_KEY`, set `OLLAMA_BASE_URL` if not default. See `.env.example` for model variables.
   - Optional: **`DIFFY_API_KEY`** for the **built-in feed** at `/api/integrations/diffy-feed`. On Vercel you usually only add this plus **`NEXT_PUBLIC_APP_URL`**; the app builds the feed URL automatically. Locally, also set **`DIFFY_API_URL`** to `http://localhost:3000/api/integrations/diffy-feed`. **`DIFFY_API_URL`** on Vercel is only required if you use an external feed or a non-standard origin.
3. Redeploy. The build runs `prisma migrate deploy` then `next build`, so the database schema is applied automatically when `DATABASE_URL` is set.

Scheduled work is one **daily** cron in `vercel.json` (`/api/cron/daily` at 06:00 UTC) so it stays within Vercel **Hobby** limits. That route refreshes FX rates and runs Diffy news ingest when Diffy env vars are set. For more frequent runs (e.g. hourly), upgrade to **Pro** and either change the schedule or call `/api/cron/fetch-news` and `/api/cron/fetch-fx` from additional cron entries. `CRON_SECRET` must be set.
