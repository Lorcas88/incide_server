## 2024-05-22 - Auth Login Crash on Invalid Email
**Vulnerability:** The `loginUser` function in `auth.service.js` crashed with a `TypeError` when checking `locked_until` on a non-existent user. This caused a 500 error instead of a 401, potentially leaking user existence information (via error code difference) and causing a denial of service risk.
**Learning:** The vulnerability existed because the code prioritized account lockout checks (to prevent enumeration) but failed to handle the case where the user is null.
**Prevention:** Always verify object existence (`user && ...`) before accessing its properties, especially in authentication logic where user existence is uncertain.
