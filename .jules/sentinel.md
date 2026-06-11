## 2025-04-22 - [SQL Injection via Dynamic Column Names in BaseModel]
**Vulnerability:** The `findOne` method in `BaseModel` (`src/core/base.model.js`) directly interpolated object keys from user-provided `conditions` into the SQL query string (`${this.table}.${key} = ?`). This allowed an attacker controlling the `conditions` keys to inject arbitrary SQL logic.
**Learning:** Even when utilizing parameterized query values (`?`), the keys (column names) themselves are not protected by parameterized statements and must be manually sanitized or validated if dynamically sourced.
**Prevention:** Always strictly validate dynamic column names against an allowlist or a strict alphanumeric/underscore regex (`/^[a-zA-Z0-9_]+$/`) before interpolating them into SQL strings.
