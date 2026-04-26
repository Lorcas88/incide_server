## 2024-05-18 - [Missing Null Check in Login Service]
**Vulnerability:** A missing null check (`user && user.locked_until`) in `auth.service.js` causes a TypeError when a user attempts to login with an unregistered email address.
**Learning:** This exposes to an attacker whether an email address is registered in the system or not (user enumeration) due to different server behaviors/responses (500 error vs. 401 error).
**Prevention:** Always ensure objects are not null before accessing their properties, particularly in authentication flows where user enumeration is a concern.
