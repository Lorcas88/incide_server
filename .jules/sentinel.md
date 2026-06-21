## 2025-02-14 - [Account Lockout Check Throws TypeError on Unregistered Emails]
**Vulnerability:** The account lockout check in `loginUser` accesses `user.locked_until` before validating that the `user` object exists.
**Learning:** If an unregistered email attempts to login, `user` is undefined (or null in my mocked test). Attempting to read `user.locked_until` triggers a TypeError (`TypeError: Cannot read properties of null (reading 'locked_until')`), causing an unhandled exception and 500 server error, which can be exploited for user enumeration.
**Prevention:** Account lockout checks must explicitly verify the user object exists (e.g., `user && user.locked_until`) to avoid TypeError and user enumeration based on HTTP 500 versus 401 response codes.
