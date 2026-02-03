## 2024-05-22 - [Input Sanitization & Validation Order]
**Vulnerability:** Potential for bypassed length validation due to sanitization or DB truncation.
**Learning:** `express-validator`'s `.escape()` converts characters to HTML entities (e.g., `<` becomes `&lt;`, `/` becomes `&#x2F;`). If `.isLength()` is called *after* `.escape()`, it checks the length of the *escaped* string. This reduces the effective character limit for users using special characters but ensures the stored data fits within database constraints.
**Prevention:** In this codebase, we place `.escape()` *before* `.isLength()` (as seen in `ticket.validator.js`) to ensure the stored data fits the limit and is safe.
