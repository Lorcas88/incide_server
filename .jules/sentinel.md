## 2024-05-24 - Account Enumeration via Locked Account Check
**Vulnerability:** The login process checked if an account was locked using `user.locked_until` without first verifying that `user` existed, leading to a `TypeError` when the email was invalid. This difference in behavior allowed attackers to enumerate valid vs. invalid email addresses.
**Learning:** Always verify that an entity exists before checking its properties. Account lockout checks should not inadvertently leak whether an email exists.
**Prevention:** Ensure `user` object is truthy before accessing its properties (e.g. `user && user.locked_until`).
