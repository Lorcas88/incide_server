## 2025-02-23 - Login User Enumeration via Crash
**Vulnerability:** The login logic accessed `user.locked_until` without checking if `user` existed, causing a `TypeError` (500) for invalid emails, while valid emails (with wrong password) returned 401. This allowed user enumeration.
**Learning:** Checking account status (locked, verified) must always be guarded by user existence checks, especially when these checks happen *before* password verification to prevent timing attacks.
**Prevention:** Always use optional chaining or explicit null checks (`user && user.property`) when accessing properties of objects that might be null, especially in authentication flows.
