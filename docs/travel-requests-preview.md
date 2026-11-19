# Phase 1 preview setup

Use synthetic traveler data and a Supabase project, operator mailbox, and Telegram chat dedicated to Preview. Set variables from .env.example in the Vercel Preview scope. Supply private keys through the provider dashboards. Do not paste them into Git, issues, or chat.

## Supabase

1. Verify the project URL and keys in the dashboard. Check the target environment before applying the migration in supabase/migrations. The migration adds tables and functions in one transaction. It does not alter existing tables. Check backups and test restoration before collecting real requests.
2. In Authentication, disable public signup and configure an appropriate password policy. Provision each staff account through the dashboard, confirm its email, then insert its Auth user UUID and display name into public.staff_members. Staff sign in with email and password and sign in again after the access token expires. Set active to false to revoke application access.
3. Use a dedicated preview server key. The database exposes no request tables or functions to anon or authenticated. Authenticated staff actions pass through server-side membership checks.
4. For a rollback after collecting data, restore the previous app deployment and leave the additive tables in place. Export or back up data before any later decision to drop them.

## Turnstile and request origin

Create a managed widget for the stable Preview hostname. Use the same hostname in APP_BASE_URL, including https. Create a secure random TRIP_REQUEST_RATE_LIMIT_SECRET separate from CRON_SECRET. The app checks the widget action and exact hostname. On Vercel, rate limiting uses the platform forwarding header. Local requests without that header share a fallback rate-limit bucket.

## Notifications

Verify the sender domain in Resend and set the operator address. Create the Telegram bot, add it to the private chat and make sure it can post. Confirm notifications using synthetic requests. Provider acceptance is recorded as sent.

The app attempts delivery after returning the request number. Configure a scheduler that can reach the environment and make authorized GET requests to /api/internal/trip-request-notifications with the Bearer CRON_SECRET. Vercel's built-in Cron targets Production deployments. For Preview, use an authorized external scheduler or trigger the endpoint manually while testing. Confirm the production scheduler and its frequency before approving a release. Failed jobs can be retried in the CRM. A Telegram timeout can leave delivery ambiguous, so retry may repeat a message.

## Google Analytics

Set the preview GA4 measurement ID if measuring the preview. Disable enhanced measurements for this data stream and mark trip_request_conversion as the sole key event for this flow. Test accepting, rejecting and revoking consent. The revised consent marker asks returning visitors to choose again.

## Acceptance

Verify both locales, the existing planner and inquiry API, fixed and flexible dates, invalid contact fields, keyboard navigation and mobile layout. Submit a synthetic request twice with the same key and check that only one CRM card exists. Verify operator and customer delivery, force a delivery failure and retry it. Verify anonymous and non-staff denial, staff revocation, CRM updates, and successful analytics events after consent. Confirm the final privacy wording, retention schedule, and hero-image usage rights before production approval.
