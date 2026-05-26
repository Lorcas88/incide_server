
## 2024-05-24 - [Fix SQL Injection vulnerability in `BaseModel.findOne()`]
**Vulnerability:** The dynamic query builder `BaseModel.findOne(conditions)` loops through keys in the `conditions` object and directly interpolates them into the SQL string as column names: `this.where(`${this.table}.${key} = ?`, [values[index]]);`. If an attacker were to pass a crafted JSON payload triggering this method, they could inject arbitrary SQL into the query by controlling the keys.
**Learning:** SQL injection can occur not just in user input values (which were correctly parameterized here), but also in dynamically generated column names or table names if they are not strictly validated against a safe allowlist.
**Prevention:** Validate all dynamically injected database identifiers (like column names) using a strict allowlist regex (e.g., `/^[a-zA-Z0-9_]+$/`) before interpolating them into SQL strings.
