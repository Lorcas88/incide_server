## 2024-05-18 - User Enumeration via Unhandled Exception in Login
**Vulnerability:** The login service attempted to access properties (`locked_until`) on a potentially null user object resulting from an email lookup, leading to a 500 error for non-existent users and a 401 for existent ones with bad passwords. This allows attackers to enumerate valid emails.
**Learning:** Security checks that rely on database records must first defensively verify the record exists before accessing its properties to prevent inadvertent data leakage through crash disparity.
**Prevention:** Always implement null checks for retrieved entities prior to applying policy checks (like lockouts) to maintain consistent response behaviors across valid and invalid inputs.
