# Automated quality checks

Run the local quality suite with `npm run test:full`. It runs TypeScript, ESLint, all Node tests, and a Webpack production build.

The Webpack build uses placeholder Preview-shaped Supabase values and blank optional provider credentials. A preload guard makes Node skip and refuse reads of `.env*` files for this build, so `.env.local` is not used. It limits build rendering to one worker thread in the QA run to avoid process-worker filesystem restrictions; normal builds are unchanged. The build writes its normal ignored output under `.next`.

Current automated coverage includes valid/invalid CRM login, expired sessions, inactive membership denial, logout, dashboard request list and filters, status/note updates, Auth recovery/callback behavior, redirect safety, SSR cookie refresh, request transport options, the trip-request API flow with mocked Supabase/Turnstile, translations, and planner/catalogue behavior. Auth and recovery tests use Supabase mocks. Inquiry email tests use a mocked Resend request. PostgREST permissions/RLS, Supabase Auth against the Preview project, SMTP, real Turnstile, Telegram, and Resend delivery are not integration-tested by the local suite. Playwright is not installed, so browser E2E is not part of `test:full`.

The Preview smoke check is separate: unauthenticated `/admin` redirects to the sign-in page, and the internal notification endpoint rejects an unauthenticated request. An authenticated CRM workflow and a real travel-request save still require safe Preview credentials/test data and a reachable Supabase Preview service.
