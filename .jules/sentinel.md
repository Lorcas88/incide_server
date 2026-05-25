## 2024-05-25 - [SQL Injection vulnerability in BaseModel]
**Vulnerability:** BaseModel `findOne` interpolated user-controlled object keys directly into SQL query strings (e.g. `WHERE ${key} = ?`).
**Learning:** Object keys used as conditions, although the values were parameterized, the keys were appended directly into SQL, creating a SQL Injection vulnerability if conditions are mapped directly from request payload without validation.
**Prevention:** Apply an allowlist validation regex (e.g., `/^[a-zA-Z0-9_]+$/`) on dynamically provided keys in SQL conditions before interpolating into the query string.
