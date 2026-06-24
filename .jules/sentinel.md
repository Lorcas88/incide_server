## 2025-02-12 - User Enumeration via Unhandled Exception
**Vulnerability:** Found a `TypeError` crash in `loginUser` when an email does not exist. The code accessed `user.locked_until` without checking if `user` existed, leading to a 500 error instead of a 401/403.
**Learning:** The assumption that `findByEmail` returns a user object (or the subsequent code structure) led to skipping a null check. Even with timing attack protections (dummy hash), logic errors can leak information via error codes (500 vs 401).
**Prevention:** Always validate object existence before accessing properties, especially in authentication flows where user input drives database lookups. Use unit tests that specifically target "not found" scenarios to verify error handling.
