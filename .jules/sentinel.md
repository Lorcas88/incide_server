## 2024-05-17 - [SQL Injection in BaseModel.findOne]
**Vulnerability:** The `findOne` method in `BaseModel` directly interpolates object keys into the SQL query without validation (`${this.table}.${key} = ?`), allowing SQL injection if a user passes arbitrary keys.
**Learning:** Object keys used as column names must be strictly validated before interpolation since parameter binding (`?`) only sanitizes values, not column names.
**Prevention:** Always validate condition keys against a strict alphanumeric/underscore regex (`/^[a-zA-Z0-9_]+$/`) before passing them to the query builder to prevent SQL injection vulnerabilities.
