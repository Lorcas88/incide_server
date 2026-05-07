## 2024-05-18 - [Prevent SQL Injection in BaseModel]
**Vulnerability:** The `findOne` method in `BaseModel` constructed queries by directly interpolating object keys into the raw SQL string (`${this.table}.${key} = ?`). This allowed potential SQL injection if the keys of the `conditions` object originated from user input.
**Learning:** Even when using parameterized queries for values, dynamically building query strings with unvalidated column names is a security risk.
**Prevention:** Always validate dynamically provided column names against an allowlist or a strict regex (e.g., `/^[a-zA-Z0-9_]+$/`) before interpolating them into SQL statements.
