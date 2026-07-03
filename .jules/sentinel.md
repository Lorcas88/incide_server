## 2024-05-24 - SQL Injection in BaseModel findOne
**Vulnerability:** The findOne method in BaseModel accepted arbitrary keys for query conditions without validation.
**Learning:** Keys passed to BaseModel.findOne(conditions) must be validated to prevent SQL injection before being interpolated into the query builder.
**Prevention:** Validating condition keys against a strict alphanumeric/underscore regex (/^[a-zA-Z0-9_]+$/) in BaseModel prevents SQL injection vulnerabilities.
