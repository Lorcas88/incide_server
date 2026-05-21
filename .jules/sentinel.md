
## 2024-05-21 - [SQL Injection via Dynamic Object Keys in ORM/Query Builder]
**Vulnerability:** The `findOne` method in `BaseModel` dynamically constructed SQL query parts (`WHERE table.key = ?`) directly from JavaScript object keys passed to it (e.g., `model.findOne({ 'email': 'test' })`) without any validation on the key itself. A malicious payload with an injection in the key (`{ "email = ? OR 1=1 --": "test" }`) could bypass parameterized queries.
**Learning:** Even when using parameterized bindings for the *values*, SQL injection is still possible if column names or dynamic query builder parts (like keys in search conditions) are interpolated directly from user input.
**Prevention:** Always validate object keys/column names used dynamically in query construction against an allowlist or strict format regex (e.g., `/^[a-zA-Z0-9_]+$/`) before including them in the SQL string.
