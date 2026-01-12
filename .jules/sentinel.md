## 2024-05-22 - Hidden Fields causing Authorization Blind Spots
**Vulnerability:** IDOR in Ticket Update/Delete. The `Ticket` model was hiding `created_by` in its default `find` method (inherited from `BaseModel` utilizing `hidden` static property). This meant the service layer couldn't check ownership because the field was stripped out before it could be inspected.
**Learning:** Model-level presentation logic (hiding fields for JSON response) can interfere with business logic (authorization checks) if they share the same retrieval methods.
**Prevention:** Use specialized methods for data retrieval when logic depends on hidden fields (e.g., `findByIdRaw`), or separate "API Model" (DTOs) from "Database Model".
