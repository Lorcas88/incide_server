# Sentinel's Journal

## 2024-05-22 - Broken User-Agent Binding in Refresh Tokens
**Vulnerability:** The Refresh Token service was vulnerable to token theft/reuse across different devices because the User-Agent validation logic was silently broken. The code attempted to access `storedToken.user_agent_hash`, but the database model only returned `user_agent`. Consequently, the security check `if (storedToken.user_agent_hash && ...)` always evaluated to false, skipping the validation entirely. Additionally, the service was storing the raw User-Agent string while the validation logic expected a hash.

**Learning:** This vulnerability existed due to a mismatch between the database schema (column names) and the property names expected by the service logic. It highlights the danger of relying on "soft" checks (like `if (property && ...)` without an `else` clause or explicit assertion that the property *should* exist. It also underscores the importance of verifying that data stored matches the format expected during validation (Raw vs Hash).

**Prevention:**
1. **Schema Verification:** Ensure property names accessed on model instances strictly match the database columns or explicitly defined aliases.
2. **Strict Validation:** When implementing security checks, throw an error if expected data (like a stored hash) is missing, rather than failing silently/skipping the check.
3. **Consistent Transformations:** Enforce data transformations (like hashing) at the service boundary for both input and output to ensure consistency.
4. **Realistic Mocking:** In unit tests, mock database responses to match the *actual* database schema, not just what the code expects, to catch such property mismatches.
