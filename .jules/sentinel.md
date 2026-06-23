## 2024-06-23 - Prevent Key-Based SQL Injection in Query Builders
**Vulnerability:** Object keys passed as search conditions to the `findOne` method were directly interpolated into SQL statements without validation, allowing for SQL injection attacks via object keys.
**Learning:** Even when using parameterized queries for values, query builder methods that interpolate dynamic column names (keys) into SQL structures are vulnerable if the keys themselves are constructed from unvalidated user input.
**Prevention:** Always validate object keys mapped to column names against strict allowlists or regex patterns (e.g., `/^[a-zA-Z0-9_]+$/`) before interpolating them into SQL statements to prevent structure manipulation.
