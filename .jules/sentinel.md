## 2024-05-12 - Replaced hardcoded bcrypt rounds with config.security.bcryptRounds
**Vulnerability:** The bcrypt salt rounds in userToken.service.js were hardcoded to 10 instead of using the central config value.
**Learning:** Hardcoding cryptographic parameters makes it difficult to upgrade security across the application and can lead to inconsistent security postures between different flows (e.g. login vs password reset).
**Prevention:** Always use centralized configuration files for security parameters to ensure consistency and ease of updates.
