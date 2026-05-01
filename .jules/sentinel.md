## 2024-05-24 - [Fix user lockout check to prevent TypeError on invalid emails]
**Vulnerability:** In `src/modules/auth/auth.service.js`, the account lockout logic attempts to access `user.locked_until` before checking if the `user` object actually exists. This leads to a `TypeError` when an invalid email is provided. This exposes whether an email address exists in the system or not via error differences, allowing for user enumeration.
**Learning:** Always check for object existence before accessing its properties, especially in authentication logic, to avoid leaking state or causing server errors.
**Prevention:** Add a null check `if (user && user.locked_until && ...)` to ensure the object exists before accessing its properties.
