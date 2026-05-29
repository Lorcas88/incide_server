## 2026-05-29 - [Missing Rate Limiting on Register and Forgot Password]
**Vulnerability:** The `/register` and `/forgot-password` endpoints were missing rate limiting configuration in `src/modules/auth/auth.routes.js`, allowing unbounded requests.
**Learning:** High-impact state-change endpoints without authentication must have strict rate limiting directly applied to their routes, as the global rate limiter is bypassed for test environments and insufficient for targeted abuse like credential stuffing or email enumeration.
**Prevention:** Always verify that every unauthenticated route in `auth.routes.js` has a dedicated limiter from `rateLimiter.middleware.js` applied.
