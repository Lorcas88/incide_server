
## 2025-02-27 - [Fix] User Enumeration via TypeError on Missing Object
**Vulnerability:** The `loginUser` function in `auth.service.js` checked `user.locked_until` without first verifying if the `user` object exists. When an attacker provides a non-existent email, a `TypeError` is thrown. This bypassed the timing attack protection (by exiting early) and allowed an attacker to enumerate users by observing the difference in response (500 Internal Server Error vs. 401 Unauthorized or taking less time).
**Learning:** Even when security features like dummy hashes for timing attack prevention are used, missing object checks (null references) can cause early exits and error state differences that compromise the intended security posture and leak information.
**Prevention:** Always verify that an object retrieved from the database is not null or undefined before accessing its properties, especially in authentication logic, to ensure uniform execution paths and error responses.
