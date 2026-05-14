## 2024-05-19 - Missing Rate Limiting on Sensitive Auth Endpoints
**Vulnerability:** The `/register` and `/forgot-password` endpoints lacked specific rate limiting, allowing potential DoS attacks, user enumeration, and spam.
**Learning:** Rate limiting must be explicitly applied at the router level for each sensitive state-change or unauthenticated endpoint. The global rate limiter is not sufficient for high-value targets like authentication.
**Prevention:** Whenever adding new endpoints related to authentication, password management, or email sending, ensure a corresponding rate limiter is created in `src/middlewares/rateLimiter.middleware.js` and applied to the route.
