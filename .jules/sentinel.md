## 2024-05-24 - Rate Limiting and TypeError Fixes
**Vulnerability:** Missing rate limiters on sensitive auth endpoints and an unhandled TypeError during login lockout checks.
**Learning:** Rate limiting is critical on unauthenticated endpoints to prevent brute-forcing or spam. Null checks before accessing properties are required to avoid leaking information through 500 errors.
**Prevention:** Apply rate limiting to all auth routes uniformly. Always confirm object existence before accessing fields (e.g. `user && user.locked_until`).
