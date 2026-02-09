# Sentinel's Journal

## 2026-02-09 - Timing Attack on Authentication
**Vulnerability:** The login endpoint exhibited a significant timing difference (approx. 70ms) between valid and invalid email addresses, allowing for user enumeration. This was caused by the early return when a user was not found, bypassing the time-intensive `bcrypt.compare` operation.
**Learning:** Even if an application returns the same error message ("Invalid Credentials"), the *time* taken to return that message can leak information. `bcrypt` hashing is designed to be slow, so skipping it creates a measurable side channel.
**Prevention:** Implement constant-time comparison logic. Always perform the hash comparison, using a pre-generated dummy hash if the user does not exist. Ensure that other checks (like account lockout) also occur in a way that preserves timing consistency or reveals information only after successful authentication.
