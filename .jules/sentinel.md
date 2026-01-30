## 2025-02-23 - Inconsistent Input Sanitization
**Vulnerability:** Found that `first_name` and `last_name` in User/Auth modules were not sanitized, while Ticket fields were.
**Learning:** Developers might overlook sanitization on fields they perceive as "safe" (like names) compared to free-text fields (like descriptions).
**Prevention:** Enforce a policy to sanitize ALL string inputs by default, or use a global middleware/ORM hook if possible. For now, check all validators manually.
