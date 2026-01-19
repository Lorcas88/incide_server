# Sentinel's Journal

## 2026-01-19 - Critical IDOR in Ticket Management
**Vulnerability:** IDOR (Insecure Direct Object Reference) in ticket management endpoints. `getAllTickets` returned all tickets regardless of user role. `getTicketById`, `updateTicket`, and `deleteTicket` did not check if the requesting user owned the ticket (unless admin).
**Learning:** The service layer relied on the controller to handle authentication but failed to implement authorization checks for resource ownership. Using `BaseModel`'s `all()` or `find()` directly without wrapping them in ownership logic exposes all data. Also, `BaseModel` hides sensitive fields like `created_by` which makes it harder to verify ownership in the service layer if using standard `find` methods that apply filters. I had to add `findRaw` to the model to bypass the filter for internal checks.
**Prevention:** Always pass the user context (User ID and Role) to service methods handling sensitive resources. Implement ownership checks (`resource.user_id === requester.id`) before returning or modifying data. Ensure models provide a way to access raw data for internal validation while keeping the public output sanitized.
