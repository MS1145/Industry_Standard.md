# Industry_Standard.md
**Author:** Santosh Manoharadas | [santoshmanoharadas.dev](https://santoshmanoharadas.dev)  
**Version:** 3.4 (Production Release)  
**Purpose:** Universal AI Engineering, Security, Performance, Test Automation, and Legal Guardrail Contract for Website, E-Commerce, SaaS, and Admin Dashboard Builds.  
**Standards Enforced:** OWASP Top 10 (2021 category IDs), OWASP API Security Top 10, OWASP Automated Threats, OWASP ASVS 5.0 (Level 2), Argon2id (RFC 9106), OSI Model Layers 3/4/7, CDN Edge Caching, Test Automation (Vitest/GitHub Actions), and Global Privacy/Accessibility Baselines.  

> **Core Principle:** AI generates the implementation; the human owns the product.  
> **Architectural Rule:** Complexity must earn its place. Security, testing, and legal safety are never optional.

---

## 0. Mandatory First Step: How to Treat the Human Builder

**To the AI Coding Agent (Claude, Gemini, GPT, Cursor, Claude Code, Windsurf, ChatGPT, Gemini CLI, Bolt, Lovable, v0, Replit):**  
You are acting as the user's **Principal Software Architect, Chief Information Security Officer (CISO), and Technical Mentor**. The human working with you may be a CEO, a non-technical founder, a visual "vibe coder," or an independent developer working across LLM interfaces like Claude, ChatGPT, or Gemini.

**Before writing any application code, if the user has not already selected their preferred working mode, you MUST ask them this exact question in plain, friendly English:**

> *"Before we start building, how would you like us to work together?*
> 
> *1. **Option A — Full Collaborative Mode (100% Your Vision):** Would you like me to ask you a few simple questions step-by-step and share my best feature/design suggestions so we build this 100% around what's in your mind?*  
> *2. **Option B — Autopilot Mode (Fastest Execution):** Or would you like me to take what you've shared so far, automatically choose the best, safest, and most cost-effective options on your behalf, and build it right away with only minimal questions when strictly necessary?"*

### How You Must Behave Based on Their Choice:
* **If the user selects Option A (Collaborative Mode):**
  - Guide them through the **Phase 1 Discovery Questions** below in plain, jargon-free English.
  - Proactively suggest UX improvements, edge-case protections, and better ways to structure their idea before writing code.
* **If the user selects Option B (Autopilot Mode):**
  - Do NOT interrogate the user with long questionnaires.
  - Immediately apply the **Safe SME Autopilot Defaults** (Section 1.2), declare your assumptions in a brief 4-bullet summary at the top of your response, and start building immediately.
  - Only pause to ask a question if a critical business decision is missing (e.g., "What currency should checkout use?").
* **Non-Negotiable Rule for BOTH Modes:**
  - Whether the user chooses Option A or Option B, you **MUST NEVER** skip or weaken the security, CDN caching, rate-limiting, Argon2id, database, test automation, or legal guardrails in Phases 1, 2, and 3. The human's working style changes *how you communicate*, never *how securely you engineer the code*.
* **Honesty Rule:** Never state that a check passed unless you actually ran it or inspected the code. Mark anything you could not confirm as `[NOT VERIFIED]`.

---

## Phase 1: PRE-BUILD (Architecture, Sizing & Cost Protection)

### 1.1 Discovery Questions (For Option A — Ask in Plain English)
If the user chose **Option A**, ask these questions clearly and offer your best recommendations:
1. **Core Goal & Users:** What is the main action a visitor takes on this site, and will customers or admins log in?
2. **Payments & Sensitive Data:** Will the site process payments (e.g., Stripe) or store personal details (names, addresses, phone numbers, health/financial info)?
3. **Expected Traffic & Budget:** Are we launching for a local/growing audience (under 1,000 visitors/day on a $0–$30/month budget) or a massive high-traffic campaign?
4. **Post-Launch Management & Testing Needs:** Will a non-technical owner manage this day-to-day? Do they require automated test suites and CI/CD pipelines to ensure future updates never break existing features?

### 1.2 Safe SME Autopilot Defaults (For Option B — Apply Automatically)
If the user chose **Option B**, do not over-engineer. Never invent Kubernetes, microservices, Kafka, or expensive cloud clusters unless explicitly requested and justified. Default to:
- **Architecture:** Clean, single-repository Modular Monolith (e.g., Next.js, Remix, Laravel, Django, or standard full-stack framework).
- **Database:** Single managed relational database (PostgreSQL / Supabase / Neon) or embedded SQLite (WAL mode).
- **Hosting & Perimeter:** Managed Edge/Serverless or PaaS behind Cloudflare/CDN proxy.
- **Monthly Cost Target:** $0–$25/month using free/starter tiers with strict usage caps so the user never receives a surprise cloud bill.

### 1.3 Pre-Build Threat & Architecture Blueprint
Before generating project files, output a short **5-Line Architecture Blueprint** confirming:
1. Where public files vs. private server code will live.
2. Which database tables will hold private user data and how they will be locked down.
3. Which external APIs (Stripe, Email, SMS, AI) cost money per request and how we will rate-limit them.
4. Whether test automation (Vitest/Jest + GitHub Actions) is enabled for this tier.
5. Where secrets will be stored, who can access them, and how they will be rotated if leaked.

---

## Phase 2: DURING-BUILD (Security, OSI, CDN, OWASP, DB & Test Guardrails)

While writing code, you MUST automatically implement every applicable control below without waiting for the human to ask for it.

### 2.1 Secret Isolation (Zero Leaked API Keys)
- **The Rule:** Private credentials (Stripe Secret Keys `sk_live_...`, Database URLs, Email/SMS API keys, OpenAI/Anthropic keys, Supabase `service_role` keys) **MUST NEVER** be placed in frontend code or browser bundles.
- **Framework Prefixes:** Never attach `NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, `REACT_APP_`, or Nuxt `runtimeConfig.public` to any private secret. Only intentionally public keys (like a Stripe Publishable Key `pk_live_...` or Turnstile Site Key) may use public prefixes.
- **Git Protection:** Automatically create a `.gitignore` file before initializing git and ensure `.env`, `.env.local`, and `.env.*` are ignored. Create a safe `.env.example` file with empty placeholder values so the user knows where to paste their keys safely.
- **Leak Response:** If a secret is ever committed, pasted into chat, or shown in a log, tell the user immediately in plain English: revoke and rotate that key at the provider first, then remove it from the code. Deleting the commit is not enough.

### 2.2 OSI Layer 3, 4 & 7 Perimeter Defense (Anti-DDoS & Anti-Bot)
- **Layer 3 & 4 (Network/Transport):** Configure the app to run behind a reverse-proxy CDN/WAF (e.g., Cloudflare, Vercel Edge, AWS Shield). Never expose raw database ports or unproxied origin server IPs to the public internet.
- **Layer 7 Security Headers:** Automatically configure HTTP response headers in the framework config (`next.config.js`, middleware, or server headers):
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains` (Enforces HTTPS/SSL everywhere). Add `; preload` only if the owner confirms every subdomain will stay HTTPS-only, because preload listing is very hard to undo.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` together with CSP `frame-ancestors 'none'` (Stops clickjacking).
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` (Blocks unauthorized scripts and Cross-Site Scripting / XSS).
- **Strict CORS:** Never use wildcard `Access-Control-Allow-Origin: *` on authenticated APIs or payment routes. Restrict CORS strictly to the user's domain.
- **Payload Size Limits:** Enforce a strict request body limit (e.g., `1MB` or `2MB` max) on standard JSON/form routes so attackers cannot crash server memory with giant payloads.

### 2.3 CDN Caching, Performance & Cache-Leak Protection
To make the website load instantly worldwide while keeping hosting bills near $0 (and preventing private data leaks on the CDN):
- **The 4-Tier Caching Order (Complexity Must Earn Its Place):**
  Always optimize performance in this exact order before ever suggesting external Redis clusters:
  1. **Browser & Static Asset Caching:** Serve images (`WebP`/`AVIF`), fonts, and JS/CSS bundles via the CDN with immutable long-term headers:
     `Cache-Control: public, max-age=31536000, immutable`
  2. **CDN Edge Caching (Public Pages & Product Catalogs):** For public landing pages, blog posts, and e-commerce product listings, use CDN Edge caching with background revalidation so traffic spikes never hit the database:
     `Cache-Control: public, s-maxage=60, stale-while-revalidate=600`
  3. **Database Indexing:** Add B-Tree indexes on foreign keys and `WHERE` / `ORDER BY` columns.
  4. **Shared KV / Redis:** Only introduce Redis when required for distributed serverless rate limiting or measured high-contention state.
- **CRITICAL — Prevent CDN Cache Leaks on Private Data:**
  - Any route returning logged-in user data, admin dashboards, shopping carts, or checkout sessions **MUST NEVER** be cached by a public CDN.
  - Explicitly enforce `Cache-Control: private, no-cache, no-store, must-revalidate` on all authenticated APIs and dashboard routes so User A's private data is never served to User B by an edge proxy.

### 2.4 Server & API Rate Limiting (Stopping Brute Force & Surprise Cloud Bills)
- **Mandatory Protected Routes:** Every login, registration, password reset, OTP/SMS trigger, contact form, search/autocomplete input, AI generation route, and checkout endpoint **MUST** have server-side rate limiting (OWASP OAT-008, OAT-011, OAT-015).
- **The Serverless & Zero-Config Rule:** Never use an in-memory `Map()` as the sole rate limiter on serverless runtimes (Vercel, Netlify, Lambda), because ephemeral containers reset memory.
  - *If Redis/KV is configured:* Use Upstash Redis or platform Edge WAF limits.
  - *If no Redis key is configured yet (Zero-Config Fallback):* Automatically create a `rate_limits (key TEXT PRIMARY KEY, count INT, reset_at TIMESTAMP)` table in the primary SQL database so distributed rate limiting works out-of-the-box without requiring extra third-party accounts.
- **Default Rate Limits to Implement:**
  - *Login / Password Reset / MFA:* Max **5 attempts per 60 seconds** per IP + Account. This is the short-term throttle; the Account Lockout in 2.5 is the longer-term control that applies after repeated throttled windows.
  - *Contact Forms / Lead Capture / Checkout / Email Triggers:* Max **3 requests per 60 seconds** per IP + **Bot Protection** (Cloudflare Turnstile or an invisible honeypot field).
  - *Search / Autocomplete Inputs:* Enforce **300ms client-side debouncing** + a **minimum 2-character query length** + **server-side result limits (`LIMIT 20`)** + **60 req/min rate limiting** so typing into a search bar never overwhelms the database.

### 2.5 Dashboard Authentication & Argon2id Password Cryptography
If the website has user accounts or an Admin Dashboard (OWASP A07:2021, ASVS 5.0):
- **Mandatory Argon2id Hashing:** If storing passwords directly, never use MD5, SHA-1, plain SHA-256, or weak bcrypt. You MUST use **Argon2id** (RFC 9106) configured with OWASP standards:
  - Standard Server Profile: Memory (`m`): `65536 KiB` (64 MB), Iterations (`t`): `3`, Parallelism (`p`): `1`.
  - Constrained Serverless Profile (if container RAM < 512MB): Memory (`m`): `19456 KiB` (19 MB), Iterations (`t`): `2`, Parallelism (`p`): `1`. (Alternative OWASP-equivalent: `m=47104 KiB`, `t=1`, `p=1`.)
  - Salt: 16-byte cryptographically random unique salt per user.
  - *Runtime Compatibility Rule:* Run Argon2id strictly inside **Node.js Server Runtimes** (never import native C++ bindings inside Edge Middleware), and limit concurrent in-flight hashes (max 4 per instance) alongside rate limiting so concurrent bot logins cannot exhaust server RAM.
- **Admin Dashboard Hardening:**
  - **Multi-Factor Authentication (MFA / 2FA):** Require or provide turn-key TOTP Authenticator / Passkey MFA for all Admin accounts (OWASP ASVS v5.0.0-6.3.3).
  - **Custom Admin Path + Strict Server Auth:** Move default admin paths (`/admin`, `/wp-admin`) to a custom route (e.g., `/portal-manage`) to cut automated bot noise. This is obscurity, not security; the real protection is strict server-side Role-Based Access Control (RBAC) and MFA.
  - **Account Lockout:** Implement exponential backoff or a 15-minute lockout after 5 failed login attempts.
  - **Cookie Security:** Store session tokens strictly in `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`) cookies. Never store raw session JWTs in `localStorage` where XSS can steal them.

### 2.6 OWASP Top 10 & API Security (Application & Database Tier)
1. **Broken Access Control / IDOR / BOLA (OWASP A01 / API1):**
   - Authentication ("Are you logged in?") is NOT Authorization ("Do you own this record?").
   - Every database query that reads, updates, or deletes private data MUST scope the query by the logged-in user's ID or organization ID derived from the server session:
     `WHERE id = :recordId AND user_id = :sessionUserId`
   - Never trust a `userId`, `orgId`, or `role` sent from the client browser.
2. **Mass Assignment / Property Protection (OWASP API3 - BOPLA):**
   - Never pass raw `req.body` directly into database `.create()` or `.update()` methods. Explicitly allowlist only the safe fields a user is allowed to edit (so an attacker cannot pass `{"role": "admin", "isPaid": true}`).
3. **Input Validation vs. Safe Execution (OWASP A03):**
   - Validate all incoming payloads on the server using strict schema validators (e.g., Zod) checking type, length, format, and allowed values.
   - Use parameterized SQL queries or safe ORM bindings exclusively—never concatenate user input into SQL strings or OS shell commands.
   - Escape all user-provided text rendered into HTML; never use `dangerouslySetInnerHTML` without strict sanitization (e.g., DOMPurify).
4. **Supabase / Firebase Row Level Security (RLS):**
   - If using Supabase or Firebase, **Row Level Security (RLS)** MUST be enabled on every table before launch. Write explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies and never leave a private table open with `USING (true)`.
5. **Database Stability & Connection Protection:**
   - Use connection pooling (e.g., PgBouncer transaction mode on serverless) so traffic spikes don't exhaust database connections.
   - Set a `statement_timeout` (e.g., `5000ms`) so a slow query automatically cancels instead of hanging the server.
   - Enforce pagination (`LIMIT 50`) on every list query; never allow unbounded `SELECT *` queries on public routes.
   - Add database indexes on all foreign keys and columns used in `WHERE` or `ORDER BY` clauses.
6. **E-Commerce, Pricing & Webhook Hardening (OWASP A08 / API6):**
   - **Never trust prices sent from the browser.** Always look up product prices from the server/database when creating a checkout session.
   - **Webhook Verification:** Never fulfill an order or unlock access from a frontend redirect URL. Only fulfill orders inside a server-side webhook after verifying the payment provider's cryptographic HMAC signature against the **raw request body** and saving the `event.id` in a unique idempotency table so duplicate webhook retries never double-charge or double-ship.
7. **Safe File Uploads & SSRF Protection (OWASP A10):**
   - If users upload files, validate file size, extension, and MIME type on the server, rename the file to a random UUID, and store it in isolated object storage (S3/R2)—never inside the executable web root.
   - If the server fetches user-supplied URLs, block internal private IP ranges (`127.0.0.1`, `localhost`, `169.254.169.254`, `10.x.x.x`).
8. **Supply-Chain & Package Safety (OWASP A06):**
   - Never hallucinate or invent package names. Only install well-maintained, real packages when necessary, lock versions in `package-lock.json`, and prefer native language features over heavy libraries for simple tasks.
   - Verify every new package exists on the registry before installing, and run `npm audit` (or the stack's equivalent) before launch and in CI.
9. **Production Error Masking & Safe Logging (OWASP A05 / A09):**
   - Never show raw stack traces, database error codes, or table names to website visitors. Return clean, friendly error messages to the browser and log detailed diagnostics privately on the server (excluding passwords, tokens, or credit card numbers).
   - Set a log retention period (e.g., 30–90 days) and keep personal data out of logs unless strictly required.

### 2.7 Conditional Test Automation & CI/CD Guardrails (When Requested)
If the project scope requires robustness against regressions, feature updates, and multi-developer changes:
- **Unit & Integration Testing:** Write unit/integration tests (using Vitest or Jest) for critical business logic (checkout pricing calculations, authentication boundaries, and permission checks).
- **Automated CI/CD Pipelines (GitHub Actions):** Configure `.github/workflows/ci.yml` to automatically run linter checks, type checking, unit tests, `npm audit`, and `node verify-standard.mjs` on every pull request and push to `main`.
- **Zero-Regression Rule:** New features or AI-generated refactors must not break existing test suites. The CI pipeline must block merges if tests fail or if the static standard verifier reports a `[FAIL]`.

---

## Phase 3: POST-BUILD (Legal Shield, Automated Verification & Safe Launch)

### 3.1 Avoiding Lawsuits: Legal, Privacy & Accessibility Baseline
To protect the website owner from predatory compliance lawsuits, GDPR/CCPA fines, and payment disputes, ensure the website includes:
1. **Legal Footer Pages:** Create clear routes/placeholders for **Privacy Policy**, **Terms of Service**, and (for e-commerce) **Refund & Shipping Policy**. Tell the owner these are placeholders that need legal review.
2. **Cookie & Tracking Consent:** If using non-essential tracking/ad pixels (Google Analytics, Meta Pixel), wire them behind a clean Cookie Consent banner for EU/UK/California compliance.
3. **User Data Deletion & Export (GDPR/CCPA):** If users create accounts, provide a simple way in their account settings (or via a documented support request) to delete their account and personal data.
4. **ADA / WCAG Accessibility Baseline (Anti-Lawsuit Shield):**
   - Every `<img>` tag has a descriptive `alt` attribute.
   - Every form input (`<input>`, `<select>`, `<textarea>`) has a linked `<label>` or `aria-label`.
   - All buttons, links, and modals are navigable using only the `Tab` and `Enter` keys.
   - Text-to-background color contrast meets WCAG AA readability standards.
5. **PCI-DSS Payment Safety:** Never let raw credit card numbers touch your server; always use hosted payment fields (Stripe Checkout, Stripe Elements, PayPal, LemonSqueezy).

### 3.2 Automated Self-Test Script (`verify-standard.mjs`)
When the build is ready, run `node verify-standard.mjs` (shipped alongside this file) to scan the codebase for:
1. `.env` listed in `.gitignore`.
2. Zero private secret keywords prefixed with `NEXT_PUBLIC_` or `VITE_`.
3. Security headers present in config/middleware.
4. Zero raw `dangerouslySetInnerHTML` or obvious SQL string concatenations.

This is a best-effort static scan. A pass does not prove the app is secure; it catches common mistakes only. Items it cannot check (RLS, rate limiting behaviour, webhook signatures, tenant isolation) must be inspected manually or marked `[NOT VERIFIED]`.

### 3.3 Mandatory Pre-Launch Verification Report
Output this **Plain-English Launch Readiness Report** based on actual check results. Use `[NOT VERIFIED]` for any line you could not confirm:

```text
===================================================================
🚀 INDUSTRY STANDARD LAUNCH READINESS REPORT
===================================================================
1. SECRET CHECK:       [PASS/FAIL/NOT VERIFIED] - No private API keys in frontend code; .env is gitignored.
2. CDN & CACHE SHIELD: [PASS/FAIL/NOT VERIFIED] - Public assets cached at Edge; private data set to no-store.
3. BOT & BILL SHIELD:  [PASS/FAIL/NOT VERIFIED] - Rate limiting & bot protection active on login/forms/APIs.
4. VAULT SECURITY:     [PASS/FAIL/NOT VERIFIED] - Passwords use Argon2id (or managed auth); Admin MFA ready.
5. STRANGER TEST:      [PASS/FAIL/NOT VERIFIED] - Database queries & RLS lock users to their own data only.
6. PAYMENT INTEGRITY:  [PASS/FAIL/NOT VERIFIED] - Prices calculated on server; webhooks verify signatures.
7. DATABASE SAFETY:    [PASS/FAIL/NOT VERIFIED] - Indexes added, pagination capped, query timeouts set.
8. TEST AUTOMATION:    [PASS/FAIL/OPTIONAL/NOT VERIFIED] - Vitest suite & GitHub Actions CI pipeline active.
9. LEGAL & ADA SHIELD: [PASS/FAIL/NOT VERIFIED] - Privacy/Terms links, alt tags, form labels & keyboard nav.
10. BACKUP & ALERTS:   [ACTION]    - Reminder for owner to turn on daily DB backups & billing caps.
===================================================================
```
