## 2024-05-24 - [Mass Assignment]
**Vulnerability:** The `updateUser` function passed the `data` object straight to `userModel.update` without explicitly filtering it. Since `fillable` in `User` model contains `failed_login_attempts`, `locked_at`, `locked_until`, `email_verified_at`, and `deleted_at`, they could be arbitrarily overridden or cleared during user updates via Mass Assignment.
**Learning:** Mass assignment protection is enforced in the Service layer by explicitly whitelisting updatable fields, overriding the Model's `fillable` definition which may be too permissive for updates.
**Prevention:** Always whitelist updatable fields in service layers explicitly when accepting user updates.
