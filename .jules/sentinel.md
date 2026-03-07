## 2024-06-13 - [Potential User Enumeration & Error on Invalid Account]
**Vulnerability:** The login process attempts to read the `locked_until` property of the `user` object without checking if the user actually exists.
**Learning:** This results in a TypeError: Cannot read properties of null (reading 'locked_until') when an invalid email is submitted. This could leak that the user does not exist via 500 errors or allow enumeration of valid/invalid accounts based on HTTP response status.
**Prevention:** Check if the user object is not null before checking account lock status.
