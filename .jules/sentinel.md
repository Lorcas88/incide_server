## 2024-06-03 - [Missing Rate Limiting on Authentication Endpoints]
**Vulnerability:** The `/register` and `/forgot-password` endpoints lacked rate limiting, making the application vulnerable to spam registration, email enumeration, and email spamming (denial of service against the email provider).
**Learning:** Even though rate limiters existed for `/login` and `/reset-password` in the central `rateLimiter.middleware.js`, they were not created or applied to all state-changing unauthenticated endpoints.
**Prevention:** All unauthenticated state-change endpoints (especially those sending emails or creating users) must be explicitly protected with dedicated rate limiters in `auth.routes.js` using the custom `createLimiter` function.
