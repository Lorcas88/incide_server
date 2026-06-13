
## 2024-06-13 - Prevent User Enumeration via Internal Server Error
**Vulnerability:** The login endpoint threw an unhandled `TypeError` (resulting in a 500 status code) when attempting to authenticate with a non-existent email address, because it tried to access the `locked_until` property on a `null` user object.
**Learning:** This bypassed the constant-time `bcrypt.compare` intended to thwart timing attacks and provided a reliable way for an attacker to enumerate valid user accounts by observing the HTTP status code (500 for invalid, 401 for valid email with wrong password).
**Prevention:** Always verify the existence of an object before accessing its properties, particularly in security-critical authentication flows where consistent error responses (e.g., generic 401 Invalid Credentials) are paramount to prevent information leakage.
