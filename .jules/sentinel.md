## 2024-05-08 - [Unchecked Type Error and Enumeration in Auth]
**Vulnerability:** In `src/modules/auth/auth.service.js`, the login check `if (user.locked_until...)` assumes `user` is always truthy. When an invalid email is provided, `user` is null, causing a TypeError (`Cannot read properties of null (reading 'locked_until')`). This is caught as an unhandled exception and results in a 500 error instead of a generic 401 error, exposing valid vs invalid emails via different status codes.
**Learning:** Always verify that an object exists before checking its properties to prevent TypeErrors and avoid user enumeration via error state discrepancy.
**Prevention:** Explicitly verify `user && user.locked_until` to avoid the null reference error.
