## 2025-02-14 - [Unchecked User Object Leads to DoS]
**Vulnerability:** A `TypeError` crash occurred when logging in with a non-existent email because the code accessed `user.locked_until` without verifying `user` existed.
**Learning:** Always validate object existence before accessing properties, especially when database queries can return null. This is critical for availability (DoS prevention).
**Prevention:** Use optional chaining (`user?.locked_until`) or explicit null checks (`user && user.locked_until`).
