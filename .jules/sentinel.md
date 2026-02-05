## 2024-05-22 - Soft Deletes in Raw SQL
**Vulnerability:** Found `findByTokenHash` using raw SQL `SELECT * FROM ...` which ignored the `deleted_at` column (soft delete).
**Learning:** `BaseModel` handles soft deletes automatically in query builder, but custom raw SQL methods bypass this protection. Developers must manually add `deleted_at IS NULL` when writing raw queries in models that support soft deletes.
**Prevention:** Always verify raw SQL queries in Models against the `soft_delete` policy. Consider adding a linter rule or helper for raw queries to enforce this.
