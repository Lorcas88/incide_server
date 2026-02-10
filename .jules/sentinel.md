## 2026-02-10 - Password Enumeration on Locked Accounts
**Vulnerability:** The login service revealed whether a password was correct or incorrect for locked accounts by returning different error codes (`INVALID_CREDENTIALS` vs `ACCOUNT_LOCKED`). This allowed an attacker to determine the correct password for a locked account by observing the error response.
**Learning:** Checking account lock status *after* checking if the password was valid allows the logic to differentiate between "wrong password" and "account locked" (with correct password).
**Prevention:** Perform the `bcrypt.compare` operation first (to maintain constant timing), then check the account lock status. If the account is locked, return `ACCOUNT_LOCKED` immediately, ignoring the result of the password comparison.
