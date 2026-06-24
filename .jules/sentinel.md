## 2024-05-23 - Login Crash User Enumeration
**Vulnerability:** Found a crash in `auth.service.js` where accessing `locked_until` on a null user object threw a TypeError. This allowed attackers to distinguish between invalid emails (500 Error) and valid emails with wrong passwords (401 Error), enabling user enumeration.
**Learning:** Checking properties on an object returned from a database query without first verifying the object exists is a common source of crashes and information leakage.
**Prevention:** Always use optional chaining (`?.`) or explicit null checks (`if (user && ...)`) before accessing properties of objects that might be null.
