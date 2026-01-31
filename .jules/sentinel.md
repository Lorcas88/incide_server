## 2024-05-22 - Input Sanitization and Length Expansion
**Vulnerability:** Stored XSS in user profile fields (`first_name`, `last_name`).
**Learning:** Applying `express-validator`'s `.escape()` sanitization expands special characters into HTML entities (e.g., `'` becomes `&#x27;`). This caused valid inputs to exceed the original length validation limit (50 chars), requiring an increase to match the database column size (100 chars).
**Prevention:** Always consider the length of the *sanitized* output when defining validation limits. Ensure database columns are sized to accommodate escaped content.
