
## 2024-05-18 - [Fix Null Pointer Exception leading to User Enumeration]
**Vulnerability:** A `TypeError: Cannot read properties of null` occurred when logging in with an email that does not exist. This resulted in a 500 error instead of a 401. This allows an attacker to enumerate valid users by distinguishing between a 500 (user not found) and a 401 (user found, wrong password).
**Learning:** Checking for properties of an object before verifying its existence can lead to unhandled exceptions and unintentionally leak information through error codes.
**Prevention:** Always verify that an object exists before checking its properties, especially in sensitive flows like authentication where consistent error codes (like 401) should be returned to prevent enumeration.
