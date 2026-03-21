## 2026-03-21 - [Prevent User Enumeration and TypeError in Login Service]
**Vulnerability:** Unhandled `TypeError` in `auth.service.js` when checking `locked_until` on a null `user` object allowed user enumeration via `500` error responses on invalid emails.
**Learning:** Accessing properties of potentially null objects without a truthiness check (`user && user.locked_until`) throws exceptions, which can leak whether a resource exists.
**Prevention:** Always check for object existence (`user && ...` or `user?.locked_until`) before accessing properties, especially in authentication flows where error differences enable enumeration.
