## 2024-05-22 - [HIGH] Ticket Assignment Authorization Bypass
**Vulnerability:** Support users were able to assign tickets to any user (including themselves or other support agents) via the `assignTicketToUser` endpoint, bypassing the business rule that only Admins can assign tickets.
**Learning:** Policy methods like `canAssign` that only check roles without context (or ignoring context) can lead to privilege escalation if they are too permissive and diverge from the documented permissions matrix.
**Prevention:** Always validate against specific business rules (e.g., "Assign to other user: No (Support)") and ensure policy methods consume necessary context. Unit tests should verify both positive and negative authorization cases against the spec.
