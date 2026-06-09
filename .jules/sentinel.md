## 2024-05-31 - [SQL Injection via Custom ORM Query Builder]
**Vulnerability:** A SQL injection vulnerability existed in `src/core/base.model.js`'s `findOne` method where object keys were directly interpolated into the query builder string (`${this.table}.${key} = ?`).
**Learning:** Even when using parameterized queries for values, failure to validate the column names (keys) when dynamically building queries can lead to SQL injection.
**Prevention:** Always validate condition keys and table/column names against an allowlist or a strict regex (e.g., `/^[a-zA-Z0-9_]+$/`) before using them to construct SQL queries dynamically.
