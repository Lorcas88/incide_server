# Sentinel's Journal

## 2024-05-22 - [Initial Journal Creation]
**Vulnerability:** N/A
**Learning:** Initialized the security journal for tracking critical learnings.
**Prevention:** N/A

## 2024-05-22 - [Mass Assignment in Ticket Updates]
**Vulnerability:** Business Logic Bypass / Mass Assignment. The `updateTicket` service allowed updating `ticket_status_id` and `created_by` because the `Ticket` model's `fillable` array included them, and the service passed the entire user-provided `data` object to the model.
**Learning:** Explicitly relying on Model `fillable` definitions is insufficient when different contexts (create vs update, user vs admin) require different field permissions. `fillable` in the model was broad (`ticket_status_id`, `created_by`), which is fine for internal logic but dangerous for user input.
**Prevention:** Implement strict input whitelisting in the Service layer (Business Logic Layer), separate from the Data Access Layer. Use DTOs or explicit field selection (`const { title, description } = data`) before updating models.
