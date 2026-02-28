## 2024-05-24 - [Rate Limiter Added to Registration and Forgot Password]
**Vulnerability:** Registration (`/register`) and Forgot Password (`/forgot-password`) endpoints were lacking proper rate limiters.
**Learning:** This exposes the application to DoS attacks on account creation and possible email spamming/enumeration attacks. Both actions are sensitive and typically consume non-trivial backend resources (password hashing, DB operations, emailing), so they must be rate-limited just as strictly as login logic.
**Prevention:** Ensure that all endpoints managing unauthenticated or publicly-exposed state changes (e.g. user creation, password resets, verification logic) apply an instance of `express-rate-limit` middleware directly via the router definition.
