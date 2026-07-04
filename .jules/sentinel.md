## 2026-07-04 - Missing Authentication on Logout Endpoint
**Vulnerability:** The `/logout` endpoint in `src/modules/auth/auth.routes.js` was missing the `authMiddleware`, allowing unauthenticated requests to potentially manipulate server state or be exploited via Cross-Site Request Forgery (CSRF).
**Learning:** Even endpoints that destroy state (like logging out) must be protected by authentication to ensure that the request originated from an authenticated user and to prevent unauthorized state manipulation.
**Prevention:** Always apply authentication middleware (`authMiddleware`) to endpoints that modify user sessions or state, including logout functionality. Ensure comprehensive route review to check for missing protections on state-changing actions.
