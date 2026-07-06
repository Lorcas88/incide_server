## 2024-05-24 - [Missing Authentication on Logout Endpoint]
**Vulnerability:** The `/logout` endpoint in `src/modules/auth/auth.routes.js` was missing the `authMiddleware`, allowing unauthenticated users to trigger logout logic and potentially manipulate session state or cause denial of service via CSRF.
**Learning:** Even endpoints that seem harmless like `/logout` need authentication checks to ensure the user requesting the logout is actually the one currently authenticated and to prevent CSRF attacks from logging users out unexpectedly.
**Prevention:** Always apply the `authMiddleware` to any endpoint that changes the state of an authenticated session, including `/logout` and `/logout-all`.
