## 2024-04-29 - Prevent User Enumeration via TypeError on Login

**Vulnerability:** The login endpoint threw an unhandled `TypeError` (HTTP 500) when an attacker attempted to log in with an email that did not exist in the database. Existing users with invalid passwords returned an HTTP 401. This allowed an attacker to enumerate valid user accounts based on the differing HTTP status codes.

**Learning:** The code intended to check if an account was locked (`user.locked_until > now`), but failed to account for `user` being `null` when the email lookup failed. Even with timing attack protection (using a dummy hash), an unhandled exception before the password comparison nullifies the defense and exposes user existence.

**Prevention:** Always verify the existence of the object before accessing its properties in conditional checks, especially in authentication flows where both valid and invalid states must be handled gracefully to prevent information leakage.
