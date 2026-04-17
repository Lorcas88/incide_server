## 2024-04-17 - Hardcoded bcrypt rounds in userToken.service.js
**Vulnerability:** The `resetPasswordUser` function in `userToken.service.js` used a hardcoded value of 10 for `bcrypt.hash`, while the rest of the application uses the centralized `config.security.bcryptRounds` configuration which could be higher (10-15 based on config.js validation).
**Learning:** Hardcoded cryptographic parameters bypass application-wide security settings and can lead to weaker password hashes if the application is configured to use a higher work factor in production.
**Prevention:** Always use centralized configuration (like `config.security.bcryptRounds`) for cryptographic parameters to ensure consistency and allow global updates to security posture.
