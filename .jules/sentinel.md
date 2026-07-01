
## 2026-07-01 - [Missing Authentication on /logout]
**Vulnerability:** The `/logout` endpoint in `src/modules/auth/auth.routes.js` lacked authentication middleware. This allowed unauthenticated users or malicious actors to potentially perform Cross-Site Request Forgery (CSRF) or abuse the endpoint without proving identity.
**Learning:** Even endpoints that destroy state (like logout) must verify the user's identity to prevent unauthorized actions and protect against CSRF attacks. Without `authMiddleware`, any request could hit the logout logic and attempt to manipulate state.
**Prevention:** Always apply authentication middleware (`authMiddleware`) to all endpoints that modify user sessions or state, including logout and token revocation endpoints.
