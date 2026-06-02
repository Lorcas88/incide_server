
## 2024-05-30 - [CRITICAL] Prevent SQL Injection in BaseModel findOne
**Vulnerability:** The `findOne` method in `BaseModel` dynamically constructed query conditions by taking object keys and interpolating them directly into a raw SQL query string (`${this.table}.${key} = ?`). This allowed for critical SQL injection if a condition key was derived from user input or unfiltered external data.
**Learning:** Even when using parameterized queries for values (the `?` placeholder), dynamic query builders must strictly validate or sanitize column names and object keys before inserting them into SQL syntax. The native parameterization doesn't protect identifiers like table or column names.
**Prevention:** Implement strict allowlists (e.g., using a regex like `/^[a-zA-Z0-9_]+$/`) to validate all dynamically generated column names or object keys used in SQL structure. If a key is invalid, explicitly throw an error rather than ignoring it or sanitizing silently, enforcing fail-secure principles.
