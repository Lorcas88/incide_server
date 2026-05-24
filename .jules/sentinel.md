## 2024-05-24 - [Fix] SQL Injection in findOne method
**Vulnerability:** The `findOne` method in `BaseModel` accepted unvalidated condition keys directly interpolated into the WHERE clause, enabling SQL injection if user input reached the condition keys.
**Learning:** Keys of conditions passed to database query methods should be strictly validated before interpolation.
**Prevention:** Validate condition keys against a strict regex (e.g., `/^[a-zA-Z0-9_]+$/`) before using them in query construction.
