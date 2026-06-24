## 2024-05-22 - Rate Limiting on Public Endpoints
**Vulnerability:** Public endpoints `/register` and `/forgot-password` lacked rate limiting, allowing potential DoS and email enumeration/spam.
**Learning:** Testing environment-dependent middleware requires resetting modules (`jest.resetModules()`) and using dynamic imports to reload configuration.
**Prevention:** Apply strict rate limits to all public-facing endpoints that trigger heavy operations (DB writes, emails) or sensitive actions.
