## 2024-05-18 - [Fix SQL Injection in BaseModel.findOne]
**Vulnerability:** SQL injection vulnerability in `BaseModel.findOne` due to dynamic key interpolation (`this.where(\`${this.table}.${key} = ?\`, [values[index]])`). If an attacker controls the keys of the `conditions` object, they can inject arbitrary SQL.
**Learning:** Condition keys were not validated before being directly interpolated into the SQL query string.
**Prevention:** Always validate column names and condition keys against a strict allowlist regex (e.g., `/^[a-zA-Z0-9_]+$/`) before interpolating them into SQL query strings.
