## 2025-05-18 - Missing Null Check leading to DoS and User Enumeration in Login
**Vulnerability:** A missing null check `if (user.locked_until ...)` in the login logic caused the app to crash with a `TypeError` (and return a 500 status code) when an unknown email address was provided. This leaked whether an email address exists in the database and also created a potential Denial-of-Service vector.
**Learning:** Checking for account lockout before checking the password requires verifying that the user object itself exists, especially in endpoints handling untrusted input (e.g., login).
**Prevention:** Always verify object presence (`user && user.locked_until`) when accessing fields of an entity that might not have been found in the database.

## 2025-05-18 - SQL Injection Vector in Dynamic Queries (BaseModel)
**Vulnerability:** The `findOne` method in `BaseModel` directly interpolates object keys (`${this.table}.${key} = ?`) into the SQL `WHERE` clause without sanitizing them. Since object keys are sometimes derived from untrusted input, this could allow SQL injection by injecting malicious SQL fragments into the column name string.
**Learning:** Parameterized queries only protect values (`?`), not identifiers (like table or column names). Identifiers must be strictly validated against an allowlist before interpolation.
**Prevention:** Always validate identifiers (e.g., column names) against a strict regex (like `/^[a-zA-Z0-9_]+$/`) or a hardcoded allowlist when building dynamic SQL queries.
