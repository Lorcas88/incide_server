
## 2024-05-24 - Missing Rate Limits on Registration and Password Recovery Endpoints
**Vulnerability:** The `/api/v1/auth/register` and `/api/v1/auth/forgot-password` endpoints lacked rate limiting, while login and other endpoints had them configured.
**Learning:** Even when some rate limiting is implemented, missing rate limiting on registration can lead to automated account creation abuse (spam/bot networks), and on password recovery can lead to email flooding or user enumeration.
**Prevention:** Ensure that ALL unauthenticated state-changing endpoints (especially in auth controllers) have strict rate limiting explicitly applied.
