## 2024-05-22 - [Auth Service]
**Vulnerability:** DoS and Information Disclosure via `TypeError` on login.
**Learning:** Checking for account lockout state (`user.locked_until`) before verifying if `user` exists caused a crash when email was not found. This exposed whether an email existed via 500 status (vs 401) and could crash the process.
**Prevention:** Always check object existence (`user && ...`) before property access in security-sensitive flows, even if logic seems to imply it (e.g., inside lockout checks).
