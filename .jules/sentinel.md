## 2024-05-18 - [Hardcoded Cryptographic Parameters]
**Vulnerability:** Found hardcoded bcrypt salt rounds (10) in `src/modules/user-tokens/userToken.service.js` during password reset, bypassing the globally configured `config.security.bcryptRounds`.
**Learning:** Developers sometimes hardcode default values for cryptographic functions in isolated flows (like password resets) instead of reusing central security configurations. This leads to inconsistent security postures across the application.
**Prevention:** Centralize all cryptographic parameters in a global configuration file and enforce their usage across all authentication and security-related services.
