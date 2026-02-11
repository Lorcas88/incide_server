# Sentinel's Journal

## 2024-05-22 - Auth Service Crash on Invalid User
**Vulnerability:** Accessing `user.locked_until` on a `null` user object caused a server crash (DoS) when logging in with a non-existent email.
**Learning:** The code attempted to check account lockout status *before* verifying credentials (to prevent timing attacks/enumeration), but failed to handle the case where the user simply doesn't exist. This highlights the risk of complex authentication flows where defensive checks might be missed.
**Prevention:** Always use optional chaining (`user?.locked_until`) or explicit null checks (`if (user && ...)` when accessing properties of database results that might be null. Unit tests should cover "not found" scenarios for all critical paths.
