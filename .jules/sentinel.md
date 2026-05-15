
## 2024-05-24 - [Missing Rate Limiters on Sensitive Endpoints]
**Vulnerability:** Missing rate limits on `/register` and `/forgot-password` endpoints, which could allow attackers to perform brute-force attacks, credential stuffing, or denial of service via rapid, automated requests.
**Learning:** Even if some rate limiters (e.g., login, reset-password) are defined and applied, developers must ensure *all* unauthenticated state-change endpoints that are sensitive (such as account creation or initiating password recovery) are protected by rate limiting to prevent abuse.
**Prevention:** Systematically apply rate limiting to all public-facing authentication and account management endpoints by default during route definitions. Always check the full list of unprotected endpoints when reviewing security.
