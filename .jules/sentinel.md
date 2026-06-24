## 2025-02-14 - Timing Attack Protection Crash
**Vulnerability:** Found a crash (TypeError) in `loginUser` when user is not found.
**Learning:** The logic to prevent timing attacks by checking `bcrypt` even when user is null was implemented, but the code subsequently accessed `user.locked_until` without checking if `user` was null.
**Prevention:** Always check object existence before accessing properties, even when implementing advanced security flows like timing attack protection.
