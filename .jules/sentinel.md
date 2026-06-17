## 2023-10-27 - [Auth Type Error user enumeration]
**Vulnerability:** A `TypeError` on `user.locked_until` occurs when logging in with a non-existent email address, breaking the authentication flow and revealing through 500 error messages whether an email address exists or not.
**Learning:** Checking properties on a potentially null object before verifying its existence causes exceptions that bypass subsequent security checks (like constant time hashing comparison).
**Prevention:** Always verify object existence (`if (user && user.property)`) before accessing its properties, especially in authentication logic to prevent information leakage.
