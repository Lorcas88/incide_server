## 2024-10-16 - Business Logic Bypass in Ticket Update
**Vulnerability:** The `updateTicket` service method allowed updating `ticket_status_id` directly, bypassing the `TicketWorkflow` logic enforced in `changeStatusTicket`. This allowed setting invalid status transitions.
**Learning:** The `BaseModel` relies on a static `fillable` array which is used for both Create and Update operations. However, the Update operation often requires stricter rules (e.g. status transitions). The service layer blocked `assigned_to` but missed `ticket_status_id`.
**Prevention:** Explicitly block sensitive fields in generic update methods in the Service layer, or use strict DTOs/Validation schemas that whitelist only allowed fields for each specific operation.
