## 2026-02-02 - Stored XSS in User Names via Email Templates
**Vulnerability:** User `first_name` and `last_name` fields were not sanitized during registration or updates. These fields are directly interpolated into HTML email templates, allowing Stored XSS / HTML Injection.
**Learning:** Developers properly escaped ticket content but overlooked user profile fields, likely assuming names wouldn't contain malicious HTML or wouldn't be rendered in a dangerous context. However, emails are HTML contexts.
**Prevention:** Enforce input sanitization (using `.escape()`) for all string fields in validators, especially those that might be rendered in HTML (like emails), or use a templating engine that auto-escapes by default (unlike the current template literal approach).
