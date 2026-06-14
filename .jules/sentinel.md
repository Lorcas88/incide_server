## 2025-02-27 - [Missing Rate Limiting]
**Vulnerability:** The `/register` and `/forgot-password` endpoints lacked rate limiting, allowing potential DoS or brute-force attacks via automation scripts on these unauthenticated public-facing routes.
**Learning:** Although limiters were defined in `src/middlewares/rateLimiter.middleware.js`, they were either missing definition (like `registerLimiter` and `forgotPasswordLimiter`) or missing application on the actual route definitions in `auth.routes.js`.
**Prevention:** Unauthenticated state-change endpoints should always have explicit rate limiting applied at the route definition level.
