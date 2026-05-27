## 2024-04-07 - [Fix User Enumeration via TypeError in Auth Service]
**Vulnerability:** A missing null check (`user.locked_until`) on a non-existent user caused a `TypeError` instead of a generic credential failure error in `loginUser()`. This exposed a 500 error allowing attackers to enumerate users by HTTP status code, bypassing the implemented timing attack protection.
**Learning:** Proper constant-time and generic fallback handling is insufficient if logic execution crashes prior to returning the generic error.
**Prevention:** Always verify that objects retrieved from external/database sources are defined (`user && user.property`) before accessing their attributes, particularly in sensitive workflows like authentication.
