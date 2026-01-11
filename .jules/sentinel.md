## 2024-05-23 - Timing Attack in Login
**Vulnerability:** User Enumeration via Timing Attack
**Learning:** Returning early when a user is not found in the login process allows attackers to distinguish between valid and invalid emails based on response time. `bcrypt.compare` is computationally expensive, so skipping it makes the request much faster.
**Prevention:** Always perform a hash comparison, even if the user is not found. Use a dummy hash (pre-calculated) to simulate the work when the user doesn't exist.
