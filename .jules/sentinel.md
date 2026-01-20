## 2026-01-20 - BaseModel Hidden Fields Risk
**Vulnerability:** IDOR checks were failing because `BaseModel.find()` automatically strips hidden fields (like `created_by`), making it impossible to check ownership in the service layer without a raw query.
**Learning:** Automatic field filtering at the model level can obscure data needed for security checks in the service layer.
**Prevention:** Use `findRaw` (newly added) or similar methods when fetching data for internal logic/validation, and only use `find`/`all` for data exposed to the API.
