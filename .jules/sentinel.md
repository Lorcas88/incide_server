## 2024-05-21 - Inconsistent Input Sanitization in Validator Chains
**Vulnerability:** User registration and management endpoints failed to sanitize `first_name` and `last_name`, permitting Stored XSS.
**Learning:** Validator chains were inconsistent; `ticket.validator.js` used `.escape()` while `user.validator.js` and `auth.validator.js` did not. This inconsistency often arises when different developers work on different modules without a shared strict pattern.
**Prevention:** Enforce a strict pattern for all string inputs in `express-validator` chains. If a field is a string, it must have `.escape()` unless explicitly documented why it needs to support HTML/rich text.
