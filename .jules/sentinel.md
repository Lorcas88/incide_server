## 2024-05-24 - [Fix TypeError and User Enumeration in Account Lockout]
**Vulnerability:** The account lockout check `if (user.locked_until && new Date(user.locked_until) > new Date())` in `auth.service.js` could throw a `TypeError: Cannot read properties of undefined (reading 'locked_until')` if the user is not found. This exposes a user enumeration vulnerability and causes server errors for invalid emails.
**Learning:** Account lockout checks must explicitly verify the user object exists before checking properties.
**Prevention:** Always verify object existence (e.g., `user && user.locked_until`) before accessing properties in authentication logic.
