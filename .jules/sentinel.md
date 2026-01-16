## 2024-05-22 - Authorization Logic Gap in Service Layer
**Vulnerability:** The `getAllTickets` service method returned all tickets regardless of the user, violating the business rule that users should only see their own tickets. The controller relied entirely on the service for scoping.
**Learning:** Even when architecture dictates that "business logic is in the service layer", it is easy to miss authorization checks if methods don't explicitly require user context.
**Prevention:** Ensure all data-retrieval service methods accept a user context (actor) and enforce scoping/filtering based on roles and IDs immediately.
