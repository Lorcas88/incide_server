## 2024-05-22 - Server Crash on Invalid Email
**Vulnerability:** Login function crashed with TypeError when checking locked status on non-existent user.
**Learning:** Checking properties of a potential null object returned by DB query.
**Prevention:** Always verify object existence before accessing properties.
