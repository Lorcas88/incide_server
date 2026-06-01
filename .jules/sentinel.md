## 2024-05-18 - User Enumeration via Unhandled TypeError
**Vulnerability:** User enumeration vulnerability existed in the login flow. When a non-existent email was submitted, the code attempted to access `user.locked_until`, throwing a `TypeError: Cannot read properties of null` and resulting in a 500 error instead of the standard 401 error.
**Learning:** Checking account lockout status *before* returning invalid credentials is correct to prevent password enumeration, but failing to check if the user exists first can inadvertently allow email enumeration via unhandled rejections/500 errors.
**Prevention:** Always verify that an object exists before accessing its properties, particularly when dealing with potentially non-existent database records during authentication logic.
