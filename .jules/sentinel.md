## 2026-01-15 - Authorization Bypass in Ticket Listing
**Vulnerability:** Regular users could list ALL tickets via `GET /tickets` because the controller called a service method that returned all tickets without filtering by user.
**Learning:** Business logic rules defined in README ("Regular users can View only their own tickets") were not implemented in the service layer. Controllers blindly trusted the service to handle data scoping.
**Prevention:** Always verify that data access methods in the Service layer require User Context (e.g., `user` object) and strictly filter data based on roles/permissions. Tests should explicitly verify that users cannot see others' data.
