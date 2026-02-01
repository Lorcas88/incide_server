## 2025-02-19 - Stored XSS in User Registration

**Vulnerability:** The user registration and admin user creation/update endpoints did not sanitize `first_name` and `last_name` fields. This allowed an attacker to register an account with a malicious script (e.g. `<script>`) as their name, which would be stored in the database. If this name is displayed in the admin panel or elsewhere without escaping, it would execute the script (Stored XSS).

**Learning:** While `express-validator` was used for validation (checking for empty fields, length, etc.), it does not automatically sanitize input. Explicit `.escape()` calls are required to convert characters like `<` and `>` into HTML entities. The vulnerability existed because the developer focused on data *validity* but missed data *safety*.

**Prevention:**
1.  Always use `.escape()` in `express-validator` chains for string fields that might contain user input, especially names and descriptions.
2.  Use output encoding/escaping in the frontend (most modern frameworks like React do this by default, but raw HTML rendering can be risky).
3.  Add Content Security Policy (CSP) headers to restrict script execution sources.
