# Sentinel Journal

## 2024-05-22 - Missing Authorization on Ticket Management
**Vulnerability:** Users could access, modify, and delete tickets belonging to other users. The application lacked ownership checks in the ticket service methods, relying solely on authentication.
**Learning:** Even with authentication middleware, explicit authorization checks (e.g., verifying resource ownership or role permissions) are crucial for every endpoint that accesses specific resources. `req.user` was available but unused in service logic.
**Prevention:** Implement role-based and ownership-based access control in the Service layer. Ensure that "find all" methods are scoped to the user unless they are an admin, and "action" methods (update, delete) verify ownership before proceeding.
