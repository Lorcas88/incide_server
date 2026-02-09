-- ============================================
-- INCIDE Database Schema
-- Incident/Ticket Management System
-- ============================================

-- Drop existing tables if they exist (for development)
-- Order: Drop tables with foreign keys first
DROP TABLE IF EXISTS user_tokens;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS ticket_status;
DROP TABLE IF EXISTS roles;

-- ============================================
-- 1. ROLES TABLE
-- ============================================
CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  
  CONSTRAINT pk_roles PRIMARY KEY (id),
  CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TICKET STATUS TABLE
-- ============================================
CREATE TABLE ticket_status (
  id INT UNSIGNED AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  
  -- Primary Keys & Unique
  CONSTRAINT pk_ticket_status PRIMARY KEY (id),
  CONSTRAINT uq_ticket_status_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. USERS TABLE
-- ============================================
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  email_active VARCHAR(255)
  GENERATED ALWAYS AS (
    CASE WHEN deleted_at IS NULL THEN email ELSE NULL END
  ) STORED,
  password VARCHAR(255) NOT NULL,
  role_id INT UNSIGNED NOT NULL DEFAULT 3,
  email_verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
	ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
  
  -- Account Lockout
  failed_login_attempts INT DEFAULT 0 COMMENT 'Counter for failed login attempts',
  locked_at DATETIME NULL COMMENT 'Timestamp when the account was locked',
  locked_until DATETIME NULL COMMENT 'Timestamp when the account will automatically unlock',
 
  -- Primary Keys & Unique
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uq_users_email UNIQUE (email_active),

  
  -- Foreign Keys
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id),

  INDEX idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TICKETS TABLE
-- ============================================
CREATE TABLE tickets (
  id INT UNSIGNED AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  ticket_status_id INT UNSIGNED NOT NULL DEFAULT 1,
  created_by INT UNSIGNED NOT NULL,
  assigned_to INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
	ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
  
  -- Primary Keys & Unique
  CONSTRAINT pk_tickets PRIMARY KEY (id),

  -- Foreign Keys
  CONSTRAINT fk_tickets_status FOREIGN KEY (ticket_status_id) 
    REFERENCES ticket_status(id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  
  CONSTRAINT fk_tickets_creator FOREIGN KEY (created_by) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT fk_tickets_assignee FOREIGN KEY (assigned_to) 
    REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  -- Indexes
  INDEX idx_tickets_status (ticket_status_id),
  INDEX idx_tickets_creator (created_by),
  INDEX idx_tickets_assignee (assigned_to),
  INDEX idx_tickets_created_at (created_at),
  INDEX idx_tickets_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE refresh_tokens (
  id INT UNSIGNED AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  revoked_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
  ip_address VARCHAR(45) NULL COMMENT 'Client IP address (supports IPv4 and IPv6)',
  user_agent VARCHAR(255) NULL COMMENT 'Client User-Agent string',

  -- Primary Keys & Unique
  CONSTRAINT pk_refresh_token PRIMARY KEY (id),

  -- Foreign Keys
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  -- Indexes
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_hash (token_hash),
  INDEX idx_refresh_tokens_expires (expires_at),
  INDEX idx_refresh_tokens_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. USER TOKENS TABLE (for email verification, password reset)
-- Uses HARD DELETE - tokens are physically removed after use
-- ============================================
CREATE TABLE user_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
    
  -- Indexes
  INDEX idx_user_tokens_hash (token_hash),
  INDEX idx_user_tokens_user (user_id),
  INDEX idx_user_tokens_expires (expires_at)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Roles
INSERT INTO roles (name) VALUES
('admin'),
('support'),
('user');

-- Insert Ticket Statuses
INSERT INTO ticket_status (name) VALUES
('open'),
('in_progress'),
('resolved'),
('closed');



-- ============================================
-- NOTES
-- ============================================
-- 1. All tables use InnoDB engine for transaction support
-- 2. UTF8MB4 charset supports emojis and international characters
-- 3. Foreign keys have appropriate ON DELETE and ON UPDATE actions
-- 4. Indexes are created on frequently queried columns
-- 5. Timestamps are automatically managed by MySQL
-- 6. Password hashes are generated using bcrypt with 10 rounds
-- 7. Token hashes should be SHA-256 of the original token
-- 8. Sample users included for testing (Admin123!, Support123!, User123!)
