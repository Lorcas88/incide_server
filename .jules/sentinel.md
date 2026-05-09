
## 2024-05-24 - Account Enumeration via TypeError
**Vulnerability:** In `auth.service.js`, the `loginUser` function checked `if (user.locked_until && ...)` before verifying the password to protect against account enumeration. However, this ironically created an account enumeration vulnerability (and potential DoS via Unhandled Promise Rejection depending on the handler) because if an invalid email was provided, `user` would be `null`, throwing a `TypeError: Cannot read properties of null (reading 'locked_until')` and bypassing the timing protection.
**Learning:** Checking object properties on potentially null objects in authentication flows is a classic vulnerability that can reveal valid vs invalid accounts.
**Prevention:** Always add a null check (`user && user.property`) when verifying properties of objects retrieved from a database before authentication logic.
