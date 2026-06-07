
## 2026-06-07 - [Null check failure leading to server crash]
**Vulnerability:** A missing null check (`user` object) in `auth.service.js` before checking `user.locked_until` resulted in an unhandled TypeError, causing 500 error crashes and allowing an attacker to determine if an email address exists based on response characteristics.
**Learning:** Checking a property (like `locked_until`) on a potentially null entity before validating the entity's existence breaks execution and bypasses timing-attack protection checks farther down the function.
**Prevention:** Always verify the object exists before attempting to read its properties, particularly in authentication flows that rely on constant-time behavior.

## 2026-06-07 - [Token query uses wrong parameter column name]
**Vulnerability:** The function `revokeToken` inside `refreshToken.service.js` queried the database using the `{ token: tokenHash }` object argument, rather than `{ token_hash: tokenHash }`, leading to a database error due to schema mismatch.
**Learning:** Database schemas and model wrappers require exact matching of column names. Not validating the payload property names mapped to queries can fail silently or cause database errors, thereby rendering the security feature (token revocation) completely broken.
**Prevention:** Always cross-reference the query column parameters with the table's schema when interacting with token columns.
