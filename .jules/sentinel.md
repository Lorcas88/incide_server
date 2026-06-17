## 2024-06-17 - [Fix] Fix user enumeration and TypeError via unhandled exception in auth.service.js
**Vulnerability:** A missing check for `user` existence before accessing `user.locked_until` in `loginUser` causes a `TypeError` when an invalid email is provided. This leads to an unhandled exception, which acts as a user enumeration vector since valid and invalid emails produce different responses (500 vs 401).
**Learning:** Always ensure objects returned from database queries are truthy before accessing their properties, particularly in authentication flows where error differences can lead to enumeration attacks.
**Prevention:** Explicitly verify `user` object existence before property access (`user && user.property`).
