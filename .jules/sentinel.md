## 2024-05-22 - Auth Service Crash on Invalid User
**Vulnerability:** The `loginUser` function in `auth.service.js` attempted to check `user.locked_until` even when `user` was `null` (not found), causing a server crash (TypeError).
**Learning:** This crash exposed user existence (500 status for invalid user vs 401 for invalid password) and caused potential denial of service. The code failed to guard access to `locked_until` after a database lookup that could return null.
**Prevention:** Always verify an object exists (`if (user && ...)`) before accessing its properties, especially when the object comes from an external source or database query that might return null.
