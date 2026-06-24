## 2024-05-22 - [Policy Logic Gap]
**Vulnerability:** TicketPolicy.canAssign allowed Support users (Role 2) to assign tickets, contradicting the requirement that only Admins can assign.
**Learning:** Policy logic (Service Layer) must strictly match the authorization requirements, even if Route middleware adds an extra layer of protection (Defense in Depth).
**Prevention:** Always verify Policy methods against security specifications and write unit tests that explicitly assert "deny" for restricted roles.
