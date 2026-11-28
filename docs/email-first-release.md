# Email-first release — 2026-11-28

## Scope
Branch: `codex/email-first-launch`, based on feature commit `5c0b00d20d407e9288d7577b85a085463daba158`.
Isolated checkout: `C:\Users\user\kyrgyzstan360-email-first`.
Original feature checkout, its untracked migration audit documents and cron configuration are unchanged.

No Production release, database changes, migrations, DNS changes or Google Ads changes are authorized here.
Existing database/CRM source remains available for a future release; it is inaccessible through this release's proxy.
All non-GET/HEAD public requests are blocked except the single email endpoint, including Next Server Action POST requests.
Account/admin and legacy APIs return 404. No notification cron is configured in this branch.

## Lead path
Browser → POST /api/email-leads → Vercel Firewall SDK → Turnstile Siteverify → Resend email API.
No Supabase client or queries are used by the homepage, form, proxy or email endpoint.
Only name and email are required. Optional dates, phone, travelers, budget and message are validated on the server.
Reply-To is the submitted syntactically validated address; mailbox ownership is NOT verified.
Exactly one operator email, no traveler confirmation or Telegram notification.
Payload is plain text; user data cannot create headers/HTML/extra recipients.
No request/error contents or credentials are logged.
Origin, Turnstile hostname and action must match. Body is bounded at 16 KB with a 4s read budget.
Provider calls have finite time limits under a 22s overall API budget.
Provider failure, timeout, missing rate-limit rule or invalid configuration fails closed.
HTTP 201 means Resend accepted the message, not proof of Gmail inbox delivery.

## Required Vercel configuration
Apply each value to the intended environment. Never copy Production secrets to Preview.
- APP_BASE_URL: exact canonical origin. Production: https://www.kyrgyzstan360.com; Preview: its stable *.vercel.app branch alias.
- NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY: matching widget, with that hostname allowed.
- RESEND_API_KEY: domain-restricted sending key for kyrgyzstan360.com.
- RESEND_FROM_EMAIL: Kyrgyzstan360 <travel@kyrgyzstan360.com>
- TRIP_REQUEST_OPERATOR_EMAIL: tataremil2@gmail.com
- TRIP_REQUEST_RATE_LIMIT_SECRET: at least 32 characters of cryptographic randomness.
- VERCEL, VERCEL_ENV, NODE_ENV: platform-controlled; never manually spoof.
- NEXT_PUBLIC_GA_MEASUREMENT_ID: optional analytics, consent required.
Supabase, Telegram, CRON_SECRET and OpenAI are not required for this release.

## Rate limit
Official @vercel/firewall SDK rule ID: k360-email-leads.
5 accepted checks per 600-second fixed window per hashed IP AND hashed email bucket.
Counters are external to the function instance. No in-memory fallback.
Preview rule created and published in Vercel, with Environment = Preview, verified after saving.
Rule ID: rule_email_leads_preview_sCsKyV.
User approved Vercel's displayed $0.50 per million allowed checks; blocked checks are free.
Production is not covered by this Preview-only rule. A corresponding Production-scoped rule is a release prerequisite, requiring approval.
Two checks per valid submission; SDK requests are subject to the platform's usage charges.
Documentation: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk

## Duplicate protection and limits
Resend idempotency key is an HMAC of the normalized lead and environment.
The same payload (including after reload/new client UUID) uses the same key/body.
Concurrent retries do not bypass rate limiting or Turnstile.
Resend retains idempotency for 24 hours; this is NOT permanent deduplication.
A changed payload or submission after that window can produce another email.
No automatic retries; a failed browser attempt requires manual resubmission/fresh Turnstile token.
Reference is an opaque HMAC-derived WEB identifier, not a CRM record number.
No durable lead database exists in this temporary mode: operator mailbox and Resend delivery history are the evidence store.
Documentation: https://resend.com/docs/dashboard/emails/idempotency-keys

## QA
Run `npm run test:full`.
Includes route type generation, TypeScript, ESLint, node tests, Webpack production build.
The build blocks .env file reads and runs without Supabase credentials.
88 tests passed in the first full run; 21 existing image warnings, no ESLint errors.
New tests cover absent protection/config, invalid input, origin, limits, Turnstile mismatch, provider failures, idempotency, plain text formatting and blocked legacy routes.
These are mocked provider tests, NOT live delivery proof.
Local production server verified 200 for EN/RU homepage, Plan My Trip, Individual/Group Tours, Rent, Winter, Guide Book, Journeys and About Emil.
Legacy plan-my-trip redirects 308 preserving query parameters.
Account/admin/legacy APIs return 404; public POST outside email endpoint returns 405.
Local mobile UI inspected at 390/320; no horizontal overflow, empty required fields show errors without sending.
Local Turnstile uses an intentionally invalid placeholder; real Turnstile must be verified on Preview.
A final fix addresses light-header contrast and removes the fixed Back button from the form to prevent overlap.

## Remaining gates
- Preview branch environment values and allowed Turnstile hostname.
- Preview deployment Ready and external browser QA.
- One authorized fictional lead to the operator; confirm actual Gmail receipt separately.
- Verify actual rate blocking without sending extra emails.
- Production rate rule and Production environment compatibility.
- Explicit final approval before any Production deployment.
Current decision: NO-GO for Production until these gates pass.

## Safe release / rollback
1. Retain current working Production deployment:
   ID FuXopCQz4FKgduvx3Aw2A8zxS1ia, main commit 5eadafeb6e3c064bf47b2c957ae4cacd47965bdc.
2. Finish Preview live QA and record exact validated commit/deployment.
3. Review only email-first release diff; do not merge the full original feature into main.
4. Ask for final Production approval with required environment/rate-rule changes.
5. Build the approved email-first commit using Production environment values, not Preview secrets.
6. Deploy only after approval; verify public pages, CAPTCHA and blocked account/admin. Do not submit a live lead without approval.
7. If a critical regression appears, use Vercel Instant Rollback to the recorded prior working deployment.
   The release does not change the database, so no DB rollback is needed.
   Rollback restores the old site's limitations; it is not an equivalent email-first implementation.
8. Keep delivery records. After verified DB backup and separately approved migrations, implement a reviewed migration path to CRM.
   Do not automatically import emails or re-send notifications.
