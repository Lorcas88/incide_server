## 2024-07-07 - [Fix user enumeration via TypeError in login]
**Vulnerability:** A missing null check on the `user` object in the login service allowed user enumeration via a 500 TypeError when logging in with a non-existent email, because the code tried to access `user.locked_until` unconditionally.
**Learning:** Always verify that an object retrieved from the database exists before accessing its properties, especially in authentication flows where error differences (e.g. 500 vs 401) can lead to enumeration attacks.
**Prevention:** Ensure proper existence checks (like `if (user && user.property)`) are placed before evaluating conditional logic on user objects.
