## 2025-02-18 - Prevent User Enumeration via Error Handling
**Vulnerability:** The `loginUser` function crashed with a `TypeError` when accessing `locked_until` on a non-existent user (null), exposing a 500 error instead of the standard 401. This allowed attackers to distinguish between invalid emails (500) and valid emails with wrong passwords (401).
**Learning:** Error handling logic for specific user properties (like account lockout) must always verify the user object exists first. Defensive coding is crucial even inside "business logic" blocks.
**Prevention:** Always use optional chaining (`?.`) or explicit null checks (`user && user.property`) when accessing properties of objects that might be null, especially in authentication flows.
