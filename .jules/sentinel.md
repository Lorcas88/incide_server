## 2024-05-24 - [Missing Rate Limits on Auth Endpoints]
**Vulnerability:** The `/register` and `/forgot-password` endpoints lacked specific rate-limiting protections, leaving them vulnerable to abuse such as spamming or credential stuffing.
**Learning:** Security features like rate limiting must be explicitly configured and applied to all endpoints handling sensitive operations or user input, not just the login endpoints.
**Prevention:** Always verify that unauthenticated endpoints, especially those involved in user lifecycle operations (registration, password resets), are protected by appropriate rate limiters to prevent DoS and abuse.
