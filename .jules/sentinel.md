## 2025-02-14 - Fix Potential User Enumeration via TypeError on Login
**Vulnerability:** A `TypeError` occurred during login if an unregistered email was provided, resulting in a 500 error instead of a generic credential failure. This distinct response could allow an attacker to enumerate which emails are registered on the platform.
**Learning:** Checking for property existence (like `user.locked_until`) without first verifying the base object (`user`) existed when fetching by email leads to runtime errors that leak system state.
**Prevention:** Always verify the existence of the returned object from the database before accessing its properties, especially in authentication flows where error parity is critical to prevent user enumeration.
