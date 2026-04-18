## 2024-04-18 - Fix SQL Injection in BaseModel findOne
**Vulnerability:** SQL Injection in `BaseModel.findOne` via unvalidated condition keys.
**Learning:** Object keys used in query builders are vulnerable to SQL injection if not validated against a strict allowlist or regex, even if values are parameterized.
**Prevention:** Always validate condition keys using a strict regex (e.g., `/^[a-zA-Z0-9_]+$/`) before interpolating them into SQL query strings.
