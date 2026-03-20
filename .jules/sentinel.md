## 2024-05-20 - [Hardcoded bcrypt Rounds]
**Vulnerability:** A hardcoded parameter of 10 rounds was used in `bcrypt.hash(password, 10)` during the password reset flow (`resetPasswordUser`), and in various integration test files.
**Learning:** Using hardcoded cryptographic parameters can lead to an inconsistent security posture when the configuration expects a different value, such as `config.security.bcryptRounds`. The application's security settings must be centrally managed and universally applied across all user flows.
**Prevention:** Ensure that all cryptographic operations retrieve their configuration parameters from the central `config` object rather than hardcoding values. Periodically review testing utilities and new user flows to confirm adherence to this practice.
