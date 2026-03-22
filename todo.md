# Maple Tariff Disruptors — MVP Development Checklist

Ordered top-to-bottom by implementation dependency. Complete each item before moving to the next phase.
Items within a phase have no inter-dependencies and can be built in parallel.

---

## Phase 1 — Project Config (no dependencies)

- [x] `package.json` — Add missing dependencies: `prisma`, `@prisma/client`, `next-auth`, `openai`, `zod`, `node-cron`, `date-fns`, `bcryptjs`, `@types/bcryptjs`
- [x] `tailwind.config.ts` — Configure Tailwind with Canadian-maple brand palette (maple red `#C41230`, off-white `#F8F4EF`, dark charcoal `#1A1A1A`)
- [x] `.env.example` — Document all required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `OPENAI_API_KEY`, `DIFFY_API_KEY`, `CRON_SECRET`

---

## Phase 2 — Types & Schema (depends on: Phase 1)

- [x] `src/types/index.ts` — Define shared TypeScript interfaces: `UserRole` (`BUSINESS | CUSTOMER`), `ProductWithBusiness`, `ReviewWithAuthor`, `NewsReportWithSources`
- [x] `prisma/schema.prisma` — Define `User` model: `id`, `email`, `name`, `passwordHash`, `role`, `createdAt`
- [x] `prisma/schema.prisma` — Define `BusinessProfile` model: `id`, `userId`, `companyName`, `industry`, `suppliers`, `mission`, `description`, `isVerified` (default `false`)
- [x] `prisma/schema.prisma` — Define `Product` model: `id`, `businessId`, `name`, `description`, `price`, `inventory`, `imageUrl`, `tags`, `createdAt`
- [x] `prisma/schema.prisma` — Define `Review` model: `id`, `productId`, `customerId`, `rating` (1–5), `body`, `createdAt`
- [x] `prisma/schema.prisma` — Define `NewsArticle` model: `id`, `title`, `url`, `summary`, `tags` (string array), `publishedAt`, `createdAt`
- [x] `prisma/schema.prisma` — Define `BusinessNewsReport` model: `id`, `businessId`, `reportTitle`, `reportBody`, `sourceArticleIds`, `createdAt`
- [x] Run `npx prisma migrate dev --name init` and `npx prisma generate` to create the DB and generate the client

---

## Phase 3 — Core Infrastructure Libraries (depends on: Phase 2)

These are pure utility modules with no UI or routing dependencies.

- [x] `src/lib/prisma.ts` — Singleton Prisma client (prevents connection pool exhaustion in dev)
- [x] `src/lib/openai.ts` — OpenAI client singleton; export `generateBusinessReport(newsItems: NewsArticle[], profile: BusinessProfile): Promise<{ title: string; report: string }>` — queries relevant news then returns a structured LLM-generated summary with action steps
- [ ] `src/lib/diffy.ts` — Export `fetchLatestNews(): Promise<NewsArticle[]>` — HTTP client that calls the Diffy API and normalizes the response into `NewsArticle` objects
- [ ] `src/lib/news-cron.ts` — Export `startNewsCron()` — uses `node-cron` to run hourly; calls `fetchLatestNews()` and upserts articles into the DB via Prisma

---

## Phase 4 — Authentication (depends on: Phase 3)

- [ ] `src/lib/auth.ts` — Configure NextAuth `authOptions` with a credentials provider (email + bcrypt password check against DB); attach `role` and `id` to the JWT and session
- [ ] `src/app/api/auth/[...nextauth]/route.ts` — Wire NextAuth route handler using `authOptions`
- [x] `src/app/api/auth/register/route.ts` — `POST` — Validate body with Zod, hash password with `bcryptjs`, create `User` in DB, return `201`
- [x] `src/middleware.ts` — Protect `/business/**` and `/marketplace/**` routes; redirect unauthenticated users to `/login`; redirect wrong-role users (e.g. a customer hitting `/business`) to their correct dashboard

---

## Phase 5 — Server-Side Data Actions (depends on: Phase 3 + Phase 4)

Reusable data-access functions called by API routes. Each file should use Prisma directly and never import route-level code.

- [ ] `src/lib/actions/products.ts` — `getProducts(filters: { search?: string; tag?: string; page?: number })`, `getProductById(id)`, `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`
- [ ] `src/lib/actions/reviews.ts` — `getReviewsForProduct(productId)`, `createReview(productId, customerId, data)`
- [ ] `src/lib/actions/news.ts` — `getRelevantNewsForBusiness(businessProfile)` (queries `NewsArticle` by matching tags), `saveBusinessReport(businessId, report)`
- [ ] `src/lib/actions/business.ts` — `getBusinessProfile(userId)`, `upsertBusinessProfile(userId, data)`, `getBusinessReports(businessId)`

---

## Phase 6 — API Routes (depends on: Phase 4 + Phase 5)

### Business Onboarding
- [ ] `src/app/api/business/onboarding/route.ts` — `POST` — Auth-gated (BUSINESS role); calls `upsertBusinessProfile`; returns updated profile

### Products
- [ ] `src/app/api/products/route.ts` — `GET` supports `?search=`, `?tag=`, `?page=` via `getProducts`; `POST` auth-gated to BUSINESS role, calls `createProduct`
- [ ] `src/app/api/products/[id]/route.ts` — `GET` returns product + reviews via `getProductById`; `PATCH` + `DELETE` auth-gated to the owning business

### Reviews
- [ ] `src/app/api/products/[id]/reviews/route.ts` — `GET` lists reviews; `POST` auth-gated to CUSTOMER role, calls `createReview`

### Business News & Reports
- [ ] `src/app/api/business/news-report/route.ts` — `GET` returns paginated past reports via `getBusinessReports`; `POST` fetches relevant news → calls `generateBusinessReport` → calls `saveBusinessReport` → returns the new report

### Cron Trigger
- [ ] `src/app/api/cron/fetch-news/route.ts` — `GET` secured by comparing `Authorization` header to `CRON_SECRET`; calls `fetchLatestNews()` and upserts articles; returns count of articles saved

---

## Phase 7 — Shared UI Components (depends on: Phase 1; no API dependency)

Build these in isolation — they are pure presentational components with no data fetching.

- [ ] `src/components/ui/Button.tsx` — Reusable button with variants: `primary` (maple red), `secondary` (outlined), `ghost`; accepts `isLoading` prop
- [ ] `src/components/ui/StarRating.tsx` — Renders 1–5 stars; accepts `value` and optional `onChange` for interactive mode vs. display mode
- [ ] `src/components/ui/ProductCard.tsx` — Card with product image, name, price, average star rating, and business name; links to `/marketplace/[id]`; uses `StarRating`
- [ ] `src/components/ui/NewsReportCard.tsx` — Card displaying report title, body excerpt, generated date, and a list of clickable source article links
- [ ] `src/components/layout/Footer.tsx` — Simple footer with logo, tagline, and copyright
- [ ] `src/components/layout/Navbar.tsx` — Top nav: logo, role-aware links (business dashboard vs. marketplace), auth state (sign in / user menu with sign out); uses NextAuth `useSession`

---

## Phase 8 — Root Layout & Public Pages (depends on: Phase 7 + Phase 4)

- [ ] `src/app/layout.tsx` — Root layout: wraps app in `SessionProvider`, renders `<Navbar>` and `<Footer>`, applies global Tailwind styles
- [ ] `src/app/page.tsx` — Landing page: full-width hero with tagline, two CTA buttons ("I'm a Business" → `/register?type=business`, "Shop Canadian" → `/register?type=customer`), brief feature highlights section
- [ ] `src/app/login/page.tsx` — Email + password form; calls NextAuth `signIn('credentials')`; on success redirects to role-appropriate dashboard
- [ ] `src/app/register/page.tsx` — Role selector tabs (Business / Customer) + registration form; `POST`s to `/api/auth/register`; auto-signs in and redirects on success

---

## Phase 9 — Business Dashboard Pages & Components (depends on: Phase 6 + Phase 7)

Build components before the pages that render them.

- [ ] `src/components/business/OnboardingForm.tsx` — Multi-step wizard: Step 1 company name + industry, Step 2 suppliers, Step 3 mission/description; `POST`s to `/api/business/onboarding` on final submit
- [ ] `src/app/business/onboarding/page.tsx` — Server-checks if `BusinessProfile` already complete (redirect to dashboard if so); renders `OnboardingForm`
- [ ] `src/components/business/NewsReportPanel.tsx` — Displays the most recent `BusinessNewsReport` via `NewsReportCard`; "Generate New Report" button triggers `POST /api/business/news-report`; shows loading state while LLM runs
- [ ] `src/components/business/ProductForm.tsx` — Controlled form for product fields (name, description, price, inventory, imageUrl, tags); used for both create and edit; `POST`/`PATCH` to products API
- [ ] `src/components/business/ProductTable.tsx` — Table of the business's products with columns: name, price, inventory, created date; Edit and Delete action buttons per row
- [ ] `src/app/business/dashboard/page.tsx` — Greeting with business name, summary stats (product count), `NewsReportPanel`, link to product management
- [ ] `src/app/business/products/page.tsx` — Fetches business's products; renders `ProductTable` + "Add New Product" button linking to `/business/products/new`
- [ ] `src/app/business/products/new/page.tsx` — Renders `ProductForm` in create mode; redirects to `/business/products` on success
- [ ] `src/app/business/products/[id]/edit/page.tsx` — Fetches existing product; renders `ProductForm` pre-populated; redirects to `/business/products` on save

---

## Phase 10 — Customer Marketplace Pages & Components (depends on: Phase 6 + Phase 7)

- [ ] `src/components/customer/SearchBar.tsx` — Controlled text input that updates the `?search=` URL query param on change (debounced 300ms); no local state for query — reads from URL
- [ ] `src/components/customer/ProductGrid.tsx` — Fetches products from `/api/products` using current URL query params; renders a responsive grid of `ProductCard` components; includes pagination controls
- [ ] `src/components/customer/ReviewList.tsx` — Renders a list of reviews: author name, `StarRating` (display), date, body text
- [ ] `src/components/customer/ReviewForm.tsx` — Interactive `StarRating` + text area; `POST`s to `/api/products/[id]/reviews`; clears and refreshes review list on success
- [ ] `src/app/marketplace/page.tsx` — Renders `SearchBar` above `ProductGrid`; URL-driven filtering (no client state)
- [ ] `src/app/marketplace/[id]/page.tsx` — Product detail: hero image, name, price, business name, full description, `ReviewList`, `ReviewForm` (shown only if authenticated CUSTOMER)

---

## Phase 11 — Tests (depends on: Phase 3–6 complete)

- [ ] `src/__tests__/lib/openai.test.ts` — Unit tests for `generateBusinessReport`: happy path returns `{title, report}`, empty news list returns graceful fallback, malformed LLM response throws typed error
- [ ] `src/__tests__/lib/diffy.test.ts` — Unit tests for `fetchLatestNews`: successful 200 response, non-200 API error, empty array result
- [ ] `src/__tests__/api/products.test.ts` — Integration tests: `GET` with search filter, `POST` as business user, `POST` as customer user (expect 403), `PATCH` by non-owner (expect 403), `DELETE`
- [ ] `src/__tests__/api/reviews.test.ts` — Tests: valid 1–5 star review, rating out of range (expect 400), unauthenticated submission (expect 401), business user submitting review (expect 403)
- [ ] `src/__tests__/api/news-report.test.ts` — Tests: authenticated business user triggers report generation, unauthenticated request (expect 401), customer role request (expect 403)

---

## Phase 12 — Deployment Config (depends on: all phases complete)

- [ ] `next.config.ts` — Configure `images.remotePatterns` to allow external product image URLs; expose `NEXT_PUBLIC_APP_URL` env var
- [ ] `vercel.json` — Add cron job: `{ "path": "/api/cron/fetch-news", "schedule": "0 * * * *" }` to trigger hourly news fetch
