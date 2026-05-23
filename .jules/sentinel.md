## 2024-05-23 - Fix SQL injection vulnerability in BaseModel

**Vulnerability:** The `BaseModel.findOne` method accepted an unvalidated `conditions` object and directly iterated over its keys, injecting them directly into the SQL string via `this.where(\`${this.table}.\${key} = ?\`, [values[index]]);`. This query builder pattern enables an attacker to inject arbitrary SQL statements if they have control over the keys passed to the conditions object.

**Learning:** When building dynamic query builders, it's not enough to parameterize values; the keys (column names and condition strings) must be explicitly allowed or validated against an extremely strict schema (e.g., `/^[a-zA-Z0-9_]+$/`). Even seemingly internal APIs like a base repository method must be defensive against arbitrary string injection on keys to prevent an attacker-controlled object from escalating to SQL injection.

**Prevention:** To avoid this in the future, always validate object keys used in query builders against a strict regex or an allowlist of known-good columns before interpolating them into SQL template strings.
