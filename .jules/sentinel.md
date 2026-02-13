## 2024-05-22 - [Auth] Unhandled TypeError in Login Flow
**Vulnerability:** Accessing `user.locked_until` without checking if `user` exists caused a `TypeError` crash (500 Internal Server Error) instead of a 401 Invalid Credentials error.
**Learning:** Even with `asyncHandler`, unhandled synchronous errors like `TypeError` can result in 500 responses, which leak information (user existence) and can be used for DoS.
**Prevention:** Always use optional chaining (`?.`) or explicit null checks (`user && ...`) when accessing properties of objects that might be null, especially in critical paths like authentication.
