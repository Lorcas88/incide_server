
## 2024-06-19 - [CRITICAL] SQL Injection in BaseModel.findOne via Unsanitized Object Keys
**Vulnerability:** The `BaseModel.findOne(conditions)` method iterated over the `conditions` object, taking the keys and directly interpolating them into the SQL WHERE clause string (e.g., `this.where(\`${this.table}.${key} = ?\`)`). Because keys were not validated, any controller passing unsanitized user objects directly to `findOne()` exposed a critical SQL injection vulnerability allowing query manipulation.
**Learning:** Even when query builders utilize prepared statements for values (`?`), directly interpolating dynamically provided strings (like object keys or user inputs representing column names) without strict validation enables SQL injection.
**Prevention:** Enforce a strict regex validation allowlist (e.g., `/^[a-zA-Z0-9_]+$/`) on object keys before dynamically appending them as column names into a SQL query string.
