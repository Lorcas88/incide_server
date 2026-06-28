## 2024-05-18 - Fix SQL Injection vulnerability in BaseModel.findOne
**Vulnerability:** The `findOne(conditions)` method directly interpolated the keys of the `conditions` object into the SQL query (`${this.table}.${key} = ?`). This exposed a potential SQL injection vulnerability if untrusted input was passed as conditions.
**Learning:** Raw string interpolation of object keys into queries without validation exposes SQL injection risks, even when values are parameterized.
**Prevention:** Always validate identifiers (like column names) against a strict allowlist or alphanumeric/underscore regex (`/^[a-zA-Z0-9_]+$/`) before interpolating them into a raw SQL query.
