# INCIDE Application

**INCIDE** is a backend-driven ticket management system that demonstrates clean architecture, RESTful API design, and role-based access control. The project is intended as a reference backend consumed by a separate frontend (e.g., a React client).

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Entities](#entities)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Status Workflow](#status-workflow)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

---

## Features

- Ticket creation & management
- Ticket status workflow (open → in_progress → closed)
- Comments on tickets
- Role-based access control (user, admin)
- Clean separation of controllers, services, and models

---

## Architecture

This project follows a server-side MVC-like structure (Controllers → Services → Models) but without UI Views inside this repo. The frontend is expected to be a separate application.

- **Controllers**: handle HTTP requests and responses
- **Services**: implement business logic and rules
- **Models**: represent the data layer and persistence

This separation improves testability, scalability, and maintainability.

---

## Entities

### User

Minimal fields:

```
id
name
email
password
role  // user | admin
```

### Ticket

Minimal fields:

```
id
title
description
status      // open | in_progress | closed
createdBy   // userId
createdAt
```

---

## API Endpoints

### Authentication

- `POST /auth/register` — register a new user
- `POST /auth/login` — authenticate and receive a token (e.g., JWT)

### Tickets

- `POST /tickets` — create a ticket
- `GET /tickets` — list tickets (users: own tickets, admin: all tickets)
- `GET /tickets/:id` — get ticket by id
- `PUT /tickets/:id` — update ticket
- `PATCH /tickets/:id/status` — change ticket status
- `DELETE /tickets/:id` — optional (soft delete)

### Users (Admin only)

- `GET /users` — list users

---

## Business Rules

- Regular users can:

  - Create tickets
  - View only their own tickets
  - Add comments to tickets they have access to
  - **Cannot** change ticket status

- Admin users can:
  - View all tickets
  - Change ticket status and manage ticket lifecycle

> Business logic and access rules are enforced in the **service layer**, not in controllers.

---

## Status Workflow

Allowed status transitions must follow this linear flow:

```
open → in_progress → closed
```

Invalid transitions are rejected by the service layer.

---

## Getting Started

1. Install dependencies:

```
npm install
```

2. Run in development mode (example):

```
npm run dev
```

3. Example: register and create a ticket (replace base URL and token as needed)

Register:

```
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret"}'
```

Login (get token):

```
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

Create ticket (using Bearer token):

```
curl -X POST http://localhost:3000/tickets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Issue title","description":"Describe the problem"}'
```

---

## Contributing

Contributions are welcome. Please open issues or pull requests and follow the repository's coding style and tests.

---

## License

Choose a license (e.g., MIT) if desired.

## Reglas de negocio

Reglas de negocio (MUY importantes)

Esto es lo que hace que el proyecto se vea serio:

Un usuario normal:

solo ve sus tickets

solo puede crear tickets

Admin:

ve todos los tickets

puede cambiar estados

Estados válidos:

open → in_progress → closed

no permitir saltos inválidos

Estas reglas van en services, no en controllers.

# Versiones futuras (para hacerlo crecer)

Aquí está lo bueno: esto vende mucho en entrevistas.

V2

Comentarios en tickets

Historial de cambios de estado

Asignación de ticket a un admin

V3

Prioridad (low | medium | high)

SLA básico

Filtros y paginación

Soft delete

V4 (nivel alto)

Notificaciones

Auditoría

Tests

Docker

Roles más finos
