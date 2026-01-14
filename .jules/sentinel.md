## 2024-05-23 - Critical: Plaintext Password Storage in User Updates
**Vulnerability:** The `updateUser` function in `user.service.js` directly passed `req.body` (including `password`) to the database model's `update` method. The `BaseModel` filtered fields based on `fillable`, and since `password` is fillable, it was updated in the database as plaintext.
**Learning:** While `createUser` correctly hashed passwords, `updateUser` was missed. This highlights the risk of inconsistent implementation across CRUD operations. Often, developers focus on "Registration" hashing but forget "Update/Reset" hashing.
**Prevention:**
1.  Always centralize sensitive data handling if possible, or use hooks/middleware in the ORM/Model layer (e.g., `beforeUpdate` hooks) to automatically hash fields named `password`.
2.  In the absence of model hooks, ensure a strict "Service Layer" validation that explicitly handles sensitive field transformations before passing data to the Data Access Layer.
3.  Add unit tests specifically checking that sensitive fields are transformed (mocking the database call to verify the payload).
