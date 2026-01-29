## 2024-05-23 - Stored XSS in User Registration
**Vulnerability:** User input (first_name, last_name) was not sanitized, allowing Stored XSS attacks via registration and profile update endpoints.
**Learning:** Adding input sanitization (like `escape()`) can significantly increase the string length (e.g., `<` becomes `&lt;`). This can cause validation failures if length checks are performed after sanitization but using the original length limits.
**Prevention:** When adding sanitization, ensure that length limits are adjusted to accommodate the escaped characters, or validate length before sanitization (though the latter has DB truncation risks). In this case, increasing the max length in the validator to match the database schema (100 chars) was the correct solution.
