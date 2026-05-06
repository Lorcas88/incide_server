## 2025-05-24 - [User Enumeration via TypeError on login]
**Vulnerability:** A missing existence check for the `user` object in `auth.service.js` could lead to a `TypeError` when checking `user.locked_until` during login with an invalid email. This discrepancy could allow for user enumeration by observing 500 status codes vs 401s for valid and invalid emails.
**Learning:** Proper null checking must be implemented for objects fetched from the database, particularly in authentication flows, to prevent unexpected errors from exposing differences in code execution paths for valid vs invalid accounts.
**Prevention:** Ensure explicit null/undefined checks are consistently applied to models returned from database queries prior to accessing their properties.
