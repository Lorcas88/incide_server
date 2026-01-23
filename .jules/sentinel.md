# Sentinel Journal

This journal documents critical security learnings, vulnerability patterns, and architectural gaps discovered during security reviews.

## Format
```markdown
## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]
```

## 2024-05-22 - Stored XSS in User Registration
**Vulnerability:** User registration and update endpoints allowed HTML tags in `first_name` and `last_name` fields.
**Learning:** Input validation was present (`express-validator`) but sanitization (`.escape()`) was missing for user profile fields, while it was present for tickets. This inconsistency suggests a lack of centralized validation strategy or review.
**Prevention:** Ensure all user-facing string inputs are sanitized using `.escape()` or similar libraries. Implement consistent validation schemas across modules.
