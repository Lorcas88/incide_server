# INCIDE - Incident Management System

A production-ready RESTful API for ticket/incident management built with Node.js, Express, and MySQL. Features JWT authentication with refresh tokens, role-based access control, and clean architecture.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## Features

- **Authentication & Authorization**
  - JWT access tokens (1h expiration)
  - Refresh token rotation (7 days expiration)
  - HttpOnly cookies for secure token storage
  - Email verification for new accounts
  - Password reset via email
  - Role-based access control (User, Support, Admin)

- **Ticket Management**
  - Create, read, update, delete tickets
  - **Soft delete** - Deleted tickets can be restored by admins
  - Status workflow validation (open → in_progress → closed)
  - Role-based visibility (users see own tickets, admins see all)
  - Ticket assignment and self-assignment

- **Security**
  - Helmet.js for HTTP headers security
  - CORS configuration
  - Rate limiting (100 req/15min)
  - Password hashing with bcrypt
  - Token hashing (SHA-256) before database storage

- **Developer Experience**
  - Interactive API documentation (Swagger/OpenAPI)
  - Comprehensive test suite (Jest + Supertest)
  - Request validation with express-validator
  - Structured logging (Winston) with environment-aware configuration
  - Hot reload in development

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 5.x
- **Database:** MySQL 8.x
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Testing:** Jest + Supertest
- **Documentation:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Security:** Helmet, bcrypt, CORS, Rate Limiting

## Architecture

This project follows a **layered architecture** pattern:

```
Controllers → Services → Models → Database
```

- **Controllers**: Handle HTTP requests/responses and input validation
- **Services**: Implement business logic and rules
- **Models**: Data access layer and database operations
- **Middlewares**: Authentication, authorization, error handling

This separation ensures:

- Testability
- Maintainability
- Scalability
- Single Responsibility Principle

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.x
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/incide_server.git
   cd incide_server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=incide_db
   DB_PORT=3306

   # JWT
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=1h
   ```

4. **Create the database**

   ```bash
   mysql -u root -p -e "CREATE DATABASE incide_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

5. **Run database migrations**

   ```bash
   npm run migrate
   ```

   This will:
   - Create all necessary tables (roles, ticket_status, users, tickets, refresh_tokens)
   - Insert seed data (roles and ticket statuses)
   - Create test users:
     - `admin@incide.com` / `Admin123!` (Admin role)
     - `support@incide.com` / `Support123!` (Support role)
     - `john@example.com` / `User123!` (User role)

6. **Run in development mode**

   ```bash
   npm run dev
   ```

7. **Run tests**

   ```bash
   npm test
   ```

The server will start on `http://localhost:3000`

### Quick Test

Use one of the test users created by migrations:

```bash
# Login as Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@incide.com",
    "password": "Admin123!"
  }'

# Login as Support
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "support@incide.com",
    "password": "Support123!"
  }'

# Login as User
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "User123!"
  }'
```

## API Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

### Main Endpoints

#### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/confirm-email` - Confirm email address with token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset email
- `POST /api/v1/auth/reset-password` - Reset password with token
- `PUT /api/v1/auth/change-password` - Change user password (requires auth)
- `POST /api/v1/auth/logout` - Logout and revoke token
- `POST /api/v1/auth/logout-all` - Logout from all devices
- `GET /api/v1/auth/me` - Get current user profile
- `DELETE /api/v1/auth/unsubscribe` - Delete account

#### Tickets

**Admin Only:**

- `GET /api/v1/tickets` - List all tickets
- `DELETE /api/v1/tickets/:id` - Soft delete ticket (sets `deleted_at`)
- `PATCH /api/v1/tickets/:id/restore` - Restore deleted ticket
- `PATCH /api/v1/tickets/:id/assign` - Assign ticket to support user

**Support Only:**

- `GET /api/v1/tickets/assigned` - List tickets assigned to me
- `GET /api/v1/tickets/without_assignment` - List unassigned tickets
- `PATCH /api/v1/tickets/:id/self_assign` - Self-assign an unassigned ticket

**User Only:**

- `GET /api/v1/tickets/created_by` - List tickets created by me

**Admin + User:**

- `POST /api/v1/tickets` - Create new ticket

**Admin + Support:**

- `PUT /api/v1/tickets/:id` - Update ticket details
- `PATCH /api/v1/tickets/:id/change_status` - Change ticket status

**All Roles (with permission validation):**

- `GET /api/v1/tickets/:id` - Get ticket details (if authorized)

#### Users (Admin only)

- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user details
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Soft delete user (sets `deleted_at`)
- `PATCH /api/v1/users/:id/restore` - Restore deleted user

### Role-Based Permissions

The system implements three user roles with different permission levels:

**Role Hierarchy:**

- **Admin (role_id: 1)** - Full system access
- **Support (role_id: 2)** - Ticket management and resolution
- **User (role_id: 3)** - Ticket creation and viewing

**Permissions Matrix:**

| Action                | Admin | Support             | User |
| --------------------- | ----- | ------------------- | ---- |
| View all tickets      | Yes   | No                  | No   |
| View assigned tickets | Yes   | Yes                 | No   |
| View created tickets  | Yes   | No                  | Yes  |
| Create ticket         | Yes   | No                  | Yes  |
| Update ticket         | Yes   | Yes (only assigned) | No   |
| Self-assign ticket    | Yes   | Yes (if unassigned) | No   |
| Assign to other user  | Yes   | No                  | No   |
| Change ticket status  | Yes   | Yes (only assigned) | No   |
| Delete ticket         | Yes   | No                  | No   |

**Business Rules:**

- **Users** can create tickets and view only tickets they created
- **Support** can view and resolve tickets assigned to them, and self-assign unassigned tickets
- **Admins** have full CRUD access to all tickets and can assign tickets to support users
- All authorization checks are enforced in the service layer using the Policy pattern

**Status Workflow:**

Ticket statuses follow a linear progression that is validated at the service layer:

```
open (1) → in_progress (2) → closed (3)
```

- Invalid transitions are automatically rejected
- Only Admin and Support (for assigned tickets) can change status
- Status constants are defined in `ticket_status.constants.js`
- Workflow validation is implemented in `ticket-status.workflow.js`

## Security

### Authentication Flow

1. **Login**: User receives access token (JWT) + refresh token (cookie)
2. **API Requests**: Include access token in `Authorization: Bearer <token>` header
3. **Token Refresh**: When access token expires, use refresh token to get new one
4. **Logout**: Revokes refresh token

### Security Features

- **Token Rotation**: Refresh tokens are rotated on each use
- **Token Hashing**: Tokens stored as SHA-256 hashes in database
- **HttpOnly Cookies**: Prevents XSS attacks
- **CORS**: Configured for specific origins
- **Rate Limiting**:
  - Global: 100 requests per 15 minutes
  - Refresh Endpoint: 5 requests per 15 minutes
- **Helmet.js**: Secure HTTP headers
- **Password Hashing**: bcrypt with 10 rounds
- **Input Validation**: All endpoints validated
- **Error Handling**: Consistent error responses

### Token Revocation

The system supports revoking refresh tokens in these scenarios:

- User logout
- Account deletion
- Password change (all sessions invalidated for security)
- Suspicious activity detection (TODO)

## Testing

The project includes comprehensive test coverage across all modules with **82 tests** and **79.57% code coverage**.

### Test Suites

- **Authentication & Authorization** (5 tests) - Login, register, profile, account deletion
- **Ticket Management** (18 tests) - CRUD, assignments, status changes, access control
- **User Management** (11 tests) - Admin-only CRUD operations
- **Refresh Tokens** (9 tests) - Token rotation, revocation, expiration
- **Business Policies** (13 tests) - Role-based permissions, ticket visibility
- **Workflow Validation** (15 tests) - Status transitions, invalid state prevention
- **Application** (11 tests) - Health checks, error handling

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js
npm test -- tickets.test.js
npm test -- users.test.js

# Run with coverage report
npm test -- --coverage
```

### Test Database Setup

Tests use a separate test database to avoid affecting development data:

```bash
# Create test database
mysql -u root -p -e "CREATE DATABASE incide_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations on test database
npm run migrate:test
```

Test environment is configured in `.env.test` with `NODE_ENV=test` to:

- Disable rate limiting for unlimited test requests
- Use isolated test database
- Mock email sending to prevent actual emails
- Enable minimal logging for cleaner test output

### Code Coverage

```
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   79.57 |    59.37 |   78.74 |      80 |
 src/modules/auth           |    84.9 |    65.38 |   76.19 |    84.9 |
 src/modules/tickets        |   80.89 |    72.22 |   75.67 |   80.57 |
 src/modules/users          |   83.54 |       55 |   78.94 |   83.54 |
 src/modules/refresh-tokens |   94.87 |       80 |    87.5 |   97.36 |
```

## Project Structure

```
incide_server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.js
│   │   ├── db.js
│   │   └── swagger.js
│   ├── core/            # Base classes
│   │   └── base.model.js
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── authorize.middleware.js
│   │   └── error.middleware.js
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── tickets/
│   │   └── users/
│   ├── utils/           # Utility functions
│   │   ├── AppError.js
│   │   ├── asyncHandler.js
│   │   ├── logger.js
│   │   └── utils.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files
├── .env.example         # Environment variables template
├── jest.config.js       # Jest configuration
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- All tests pass
- Code follows existing style
- New features include tests
- Documentation is updated

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Carlos González**

- GitHub: [@Lorcas88](https://github.com/Lorcas88)
- LinkedIn: [Carlos González](https://www.linkedin.com/in/carlos-gonzalez-parra/)

## Acknowledgments

- Built as a portfolio project demonstrating backend development skills
- Follows industry best practices for Node.js/Express applications
- Inspired by real-world ticket management systems

---

**Note**: This is a portfolio/learning project. For production use, consider additional features like email verification, password reset, audit logging, and comprehensive monitoring.
