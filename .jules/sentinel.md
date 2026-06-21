## 2024-05-03 - [Fix TypeError in loginUser leading to User Enumeration]
**Vulnerability:** A missing null check on the `user` object in `src/modules/auth/auth.service.js` before accessing `user.locked_until` caused a 500 Internal Server Error when logging in with a non-existent email address.
**Learning:** This unhandled exception breaks the standard flow that aims to return generic "Invalid credentials" errors, effectively allowing attackers to distinguish between existing and non-existing email addresses (User Enumeration).
**Prevention:** Always verify that an object exists (e.g. `user && user.property`) before accessing its properties, especially in authentication logic where error responses must remain uniform to prevent enumeration attacks.
