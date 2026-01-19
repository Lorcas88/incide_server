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
  - Role-based access control (User, Admin)

- **Ticket Management**
  - Create, read, update, delete tickets
  - Status workflow validation (open → in_progress → closed)
  - Role-based visibility (users see own tickets, admins see all)

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
  - Structured logging (Morgan + Winston)
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
   # Create database and tables (SQL script needed)
   mysql -u root -p < database/schema.sql
   ```

5. **Run in development mode**

   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

The server will start on `http://localhost:3000`

### Quick Test

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
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
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and revoke token
- `GET /api/v1/auth/me` - Get current user profile
- `DELETE /api/v1/auth/unsubscribe` - Delete account

#### Tickets

- `GET /api/v1/tickets` - List tickets (filtered by role)
- `GET /api/v1/tickets/:id` - Get ticket details
- `POST /api/v1/tickets` - Create new ticket
- `PUT /api/v1/tickets/:id` - Update ticket
- `DELETE /api/v1/tickets/:id` - Delete ticket

#### Users (Admin only)

- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user details
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Business Rules

**Regular Users:**

- Create tickets
- View only their own tickets
- Cannot change ticket status
- Cannot view other users' tickets

**Admin Users:**

- View all tickets
- Change ticket status
- Manage users
- Full CRUD on all resources

**Status Workflow:**

```
open → in_progress → closed
```

Invalid transitions are rejected by the service layer.

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
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet.js**: Secure HTTP headers
- **Password Hashing**: bcrypt with 10 rounds
- **Input Validation**: All endpoints validated
- **Error Handling**: Consistent error responses

### Token Revocation

The system supports revoking refresh tokens in these scenarios:

- User logout
- Account deletion
- Password change (TODO)
- Suspicious activity detection (TODO)

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

Current test coverage:

- Authentication endpoints
- Ticket CRUD operations
- Authorization middleware
- Business rules validation (TODO)

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
