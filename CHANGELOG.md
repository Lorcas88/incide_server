# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test suite with 82 tests and 79.57% code coverage
- Business logic tests for ticket policies and workflow validation
- Integration tests for all API endpoints (auth, tickets, users)
- Refresh token lifecycle tests (rotation, revocation, expiration)
- Centralized validation middleware to eliminate code duplication
- Test database setup with separate migrations
- Rate limiter bypass for testing environment
- Email sender mock for testing
- Minimal logging format for cleaner test output

### Changed

- Translated all Spanish comments and validation messages to English
- Refactored `validateResult` middleware to centralized location
- Updated README with comprehensive testing documentation
- Improved logger with test-specific format
- Enhanced TODO.md with completed testing tasks

### Fixed

- Missing `User` model import in ticket service
- Rate limiting blocking test requests
- Email verification requirement in sample data

## [1.0.0] - 2026-01-26

### Added

- User authentication system (register, login, logout)
- Email verification with token-based confirmation
- Password reset functionality via email
- JWT-based authentication with refresh token rotation
- Role-based access control (Admin, Support, User)
- Ticket management system with CRUD operations
- Ticket assignment workflows (admin assign, self-assign)
- Ticket status workflow with validation
- Email notifications for ticket events
- Rate limiting for security (global and endpoint-specific)
- Comprehensive API documentation with Swagger
- Database migrations system
- Structured logging with Winston
- Error handling middleware
- Input validation with express-validator
- Policy-based authorization
- Refresh token cleanup job

### Security

- Password hashing with bcrypt (10 rounds)
- Token hashing with SHA-256 before database storage
- HttpOnly cookies for refresh tokens
- CORS configuration
- Helmet.js for HTTP security headers
- Rate limiting on sensitive endpoints
- Email enumeration prevention
- Session revocation on password change

### Database

- MySQL 8.x with InnoDB engine
- UTF8MB4 charset for international support
- Foreign key constraints with cascade actions
- Indexes on frequently queried columns
- Automatic timestamp management
- Sample users for testing

### Documentation

- Comprehensive README with setup instructions
- API documentation via Swagger UI
- Code comments in English
- TODO list for future improvements
- Environment variable examples

[Unreleased]: https://github.com/Lorcas88/incide_server/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Lorcas88/incide_server/releases/tag/v1.0.0
