## 2024-07-08 - [Uncaught TypeError during login enumeration check]
**Vulnerability:** A `TypeError: Cannot read properties of null (reading 'locked_until')` occurs if a non-existent email is provided for login, because `user.locked_until` is accessed before checking if `user` exists. This bug leaks that an email is not in the system.
**Learning:** Checking for account lockout before checking for user existence leads to a server crash and error leakage on invalid emails.
**Prevention:** Always verify `user` object existence before accessing its properties during authentication flows.
