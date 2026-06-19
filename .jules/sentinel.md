## 2024-04-20 - [Fix SQL Injection in BaseModel]
**Vulnerability:** SQL injection vulnerability in `BaseModel.findOne` where condition keys were directly interpolated into the query builder without validation. This allowed an attacker to pass arbitrary SQL strings as keys (e.g., `{"email = 'admin' OR 1=1 --": ""}`) leading to unauthorized access.
**Learning:** Even when using parameterized queries for values, keys or column names must also be strictly validated if they are dynamically constructed from user input, as they cannot be parameterized in the same way.
**Prevention:** Enforce strict allowlist validation (like an alphanumeric/underscore regex) on dynamically constructed column names before passing them to the query builder.
