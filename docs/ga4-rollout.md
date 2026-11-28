# GA4 and Google Ads release preparation

## Current status

The live Web v1 artifact at 5a21d21 and the Vercel Project/Shared variable lists contain no Google Analytics Measurement ID. The existing Kyrgyzstan360 GA4 property shows web stream G-7E21DKNY7N and reports no site data yet. The stream and account link must be reviewed before wiring this ID to a deployment. The optimization branch adds the integration. Google Analytics and Google Ads account settings were not edited. An account link, stream settings, and working Ads attribution still need verification before activating conversion measurement.

## Vercel configuration

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — the public `G-…` ID of the reviewed GA4 web stream. The build stays silent when this value is absent or invalid. Use separate production and QA streams or leave Preview unconfigured.
- `NEXT_PUBLIC_GA_UTM_ALLOWLIST` — optional JSON of approved, non-personal label values per UTM key. Example: `{"utm_campaign":["summer-2027"],"utm_content":["hero-a"],"utm_id":["100001"]}`. Built-in source and medium values cover common campaign labels. Unknown labels, duplicated parameters, raw query strings, arbitrary URLs, and raw referrers are discarded. Never put names, identifiers, phone numbers, or contact details in campaign labels. These variables are public and compiled at build time.

## Consent and measurement

- The tag loads only after a v3 cookie choice accepting analytics. The new banner asks again because measurement now spans public pages. The visitor may separately opt in to ad attribution using the unchecked box. Personalization, Google signals, and ad cookie storage stay off. Rejecting or resetting consent stops future tracking and clears the site's session attribution state. Attribution before consent is held only in the loaded document, so an early full navigation can lose it.
- On the public path, `page_view` runs after consent and on a different route. Internal navigation uses sanitized public paths; dynamic tour/journey details are grouped by route. Landing path, a recognized external source, and approved campaign values are retained in session storage after consent. A permitted `gclid` is carried in sanitized measurement URLs only with the optional ad-attribution choice. These measurement URLs do not change browser navigation.
- `build_your_adventure_click` covers the marked Build Your Adventure CTA links to the trip-planning page. `trip_request_conversion` counts only a fresh HTTP 201 acceptance (the Resend replay flag must be false). The request reference is used only by the browser to prevent duplicates. Name, email, phone, form content, and reference never enter events. A first response lost after email delivery can undercount on a replay, by design.
- Before enabling the stream, disable Enhanced Measurement or at least browser-history page views, form interactions, site search, and any automatic collection that could send raw URLs or duplicate events. Confirm email and URL/query data redaction in the web stream. The application sets `send_page_view: false` so only its own page views are counted. Inspect fresh visits, SPA navigation, consent issuance and withdrawal in Tag Assistant/DebugView on a QA stream. Verify that unwanted parameters never leave and that an approved campaign stays attached. Validate a successful lead only with separate test approval or in a sandbox with email delivery mocked.
- Browser/browser-extension blocking, visitor consent choices, Google ad-storage restrictions and lost responses can prevent attribution. Confirm click-ID-keyed reporting against a real test campaign before using an imported conversion for bidding. This implementation does not send enhanced conversions or user-provided data.

## Prepared Google Ads import

1. After separate approval to configure Google services, verify that the GA4 property and the Ads account are correctly linked and that auto-tagging is already on. Use a verified website stream. Confirm one `trip_request_conversion` in DebugView for a fresh accepted lead and none for the duplicate/replay.
2. Mark only `trip_request_conversion` as the key event for this form. Do not use `form_submit`, `trip_request_started`, or CTA clicks as lead conversions.
3. In Ads use **Goals → Conversions → Summary → Create conversion action → Import → Google Analytics 4 (Web)** and select only `trip_request_conversion`. Use lead category and **Count: One**. Check if the action is already imported before creating anything. Keep it Secondary until measurement is verified and the owner approves any campaign optimization changes.
4. Verify that the same website form has only one counted lead action. Do not add a parallel Google Ads website tag, GTM event, or enhanced-conversions action for the same form. Leave campaigns and budgets unchanged.

Sources: [Page views](https://developers.google.com/analytics/devguides/collection/ga4/views), [Consent mode](https://developers.google.com/tag-platform/security/guides/consent), [Data redaction](https://support.google.com/analytics/answer/13544947), and [Google Ads import](https://support.google.com/google-ads/answer/2375435).
