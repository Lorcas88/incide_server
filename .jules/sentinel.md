## 2026-03-11 - [Add Missing Rate Limiters on Authentication Endpoints]
**Vulnerability:** The `/register` and `/forgot-password` endpoints were missing explicit rate limiters, leaving them vulnerable to abuse such as brute-forcing and email spamming.
**Learning:** Rate limiting is critical on state-change endpoints that are unauthenticated. While `/login` and `/reset-password` had them, `/register` and `/forgot-password` were overlooked, indicating a need for a uniform review of all public-facing authentication routes.
**Prevention:** Ensure all unauthenticated endpoints that result in database writes or emails sent have appropriate rate limiting applied.
