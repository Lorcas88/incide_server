## 2025-02-23 - Plaintext Password Storage in Update Service

**Vulnerability:** The `updateUser` service in `src/modules/users/user.service.js` directly passed user input to the model's update method. This allowed updating the `password` field with a plaintext string, bypassing the hashing logic present in the creation flow, resulting in plaintext passwords stored in the database.

**Learning:** The `BaseModel.update` method is generic and trusts the caller. The Service layer assumed the data was ready for storage. Generic update operations in services are risky when sensitive fields (like passwords) require transformation.

**Prevention:** Explicitly handle sensitive fields in service update methods. Do not blindly pass `data` object to the model. Validate and transform sensitive data (like hashing passwords) before invoking persistence layers.
