## 2025-02-27 - [Fix Missing User Null Check in Auth Service]
**Vulnerability:** The `loginUser` function accessed properties of the `user` object (`user.locked_until`) without first verifying that the user existed.
**Learning:** This oversight allowed a TypeError to occur and return a 500 status code when an attacker tried to login with an unregistered email, revealing whether an email exists in the database.
**Prevention:** Ensure `user` object existence check before evaluating its properties (`if (user && user.locked_until ...)`).
