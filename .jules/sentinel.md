## 2024-05-18 - SQL Injection via Unvalidated Object Keys in BaseModel

**Vulnerability:** The `findOne` method in the base query builder (`src/core/base.model.js`) iterated over user-supplied object keys and interpolated them directly into the SQL WHERE clause string (e.g., `this.where(\`\${this.table}.\${key} = ?\`, ...)`). This allowed SQL injection if an attacker could control the keys of the object passed to `findOne`.
**Learning:** Even when using parameterized queries (with `?`) for the *values*, interpolating dynamically generated or unvalidated *keys/column names* directly into SQL strings creates an injection vector. The query builder bypassed standard parameterization for the column name itself.
**Prevention:** Always validate column names and object keys against a strict allowlist (like a regex `/^[a-zA-Z0-9_]+$/` for valid SQL identifiers) before interpolating them into SQL strings, even when using modern database libraries.
