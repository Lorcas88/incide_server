
## 2024-06-11 - [SQL Injection Vulnerability in BaseModel.findOne]
**Vulnerability:** Unvalidated dynamic column names passed to `findOne(conditions)` allowed potential SQL Injection by injecting SQL payloads into column names which were directly interpolated into queries.
**Learning:** Object keys used to construct query filters in `BaseModel` dynamically interpolate column names without validation, bypassing parameterization which only protects values.
**Prevention:** Keys in query builders must be strictly validated against a known pattern (e.g. alphanumeric/underscore regex) or checked against an explicit allowlist before being used in dynamic string interpolation.
