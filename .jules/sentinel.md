## 2024-06-10 - [Fix SQL Injection in BaseModel findOne]
**Vulnerability:** The `findOne` method in `src/core/base.model.js` iterated over `conditions` object keys and directly interpolated them into the SQL query without any sanitization or validation, leading to a SQL injection vulnerability.
**Learning:** Even when utilizing a query builder, we must not blindly trust the structure or keys of objects used to build queries, since attackers could provide malicious key values if user input dictates the keys.
**Prevention:** Validate all object keys using a strict allowlist regex (e.g., `/^[a-zA-Z0-9_]+$/`) prior to interpolating them into a query string as column identifiers.
