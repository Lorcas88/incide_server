## 2024-05-24 - [CRITICAL] Fix TypeError in login User Enumeration
**Vulnerability:** A `TypeError` in `loginUser` caused by attempting to access `locked_until` on a `null` user object when the email didn't exist in the database, breaking generic error responses and resulting in a 500 error, thus enabling user enumeration.
**Learning:** Even when timing attacks are mitigated, unprotected property accesses on potentially null database responses can lead to unhandled exceptions that leak whether a user exists.
**Prevention:** Always verify that an object retrieved from the database exists (e.g., `if (user && user.property)`) before attempting to check its properties, especially in authentication paths.
