## 2025-04-16 - Prevent TypeError on Locked Account Check
**Vulnerability:** In `loginUser` (`src/modules/auth/auth.service.js`), checking `user.locked_until` before verifying the `user` object exists causes a `TypeError` if an invalid email is provided, leading to an unhandled exception and a 500 status code. This allows an attacker to enumerate valid vs. invalid emails based on the error response.
**Learning:** Defensive checks for account lockout statuses must ensure the user object actually exists prior to property access, particularly when the system uses dummy hashes to prevent timing attacks.
**Prevention:** Always verify `user != null` (e.g., `user && user.locked_until`) before attempting to access account-specific lockout properties during authentication.
