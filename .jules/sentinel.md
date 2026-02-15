## 2026-02-15 - User Enumeration via Crash
**Vulnerability:** A `TypeError` crash in `loginUser` when an email does not exist allowed attackers to distinguish between valid and invalid emails by observing 500 vs 401 status codes.
**Learning:** Checking properties on potentially null objects (`user.locked_until`) without existence checks is a common source of crashes that can lead to information disclosure.
**Prevention:** Always verify object existence before accessing properties, especially when the object comes from a database query that might return null.
