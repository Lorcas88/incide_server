## 2026-04-02 - Rate Limiting Enhancement
**Vulnerability:** Missing rate limiters on unauthenticated, sensitive endpoints (/register and /forgot-password)
**Learning:** Certain endpoints were left without rate limiters despite their sensitive nature, leaving them vulnerable to abuse, credential stuffing, and spam.
**Prevention:** Apply consistent rate limiting to all unauthenticated state-change endpoints directly in the router definition using the custom `createLimiter` utility.
