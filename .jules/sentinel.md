## 2024-06-06 - [Critical] SQL Injection in BaseModel findOne

**Vulnerability:** The `findOne` method in `BaseModel` (`src/core/base.model.js`) directly injected keys from the `conditions` object into the SQL query string (`${this.table}.${key} = ?`) without any validation or sanitization. If an attacker controlled the keys of the `conditions` object, they could inject arbitrary SQL logic.

**Learning:** When building query strings dynamically, it's not enough to parameterize the values. The structure of the query, including column names, must also be validated to ensure it's safe. Blindly trusting keys of an object for SQL compilation is dangerous.

**Prevention:** Validate all dynamically injected column names against a strict allowlist or regex (e.g., `/^[a-zA-Z0-9_]+$/`) to ensure they only contain valid identifier characters before interpolating them into a query string.
