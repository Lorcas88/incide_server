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
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  role_id INT UNSIGNED NOT NULL DEFAULT 3,
  email_verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
	ON UPDATE CURRENT_TIMESTAMP,
  
  -- Primary Keys & Unique
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_is_active CHECK (is_active IN (0, 1)),
  
  -- Foreign Keys
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id),
  INDEX idx_users_active (is_active)
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
  INDEX idx_tickets_created_at (created_at)
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
  revoked_at TIMESTAMP NULL,

  -- Primary Keys & Unique
  CONSTRAINT pk_refresh_token PRIMARY KEY (id),

  -- Foreign Keys
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  -- Indexes
  INDEX idx_refresh_tokens_hash (token_hash),
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. USER TOKENS TABLE
-- ============================================
CREATE TABLE user_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
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
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Admin User (password: Admin123!)
INSERT INTO users (first_name, last_name, email, password, is_active, role_id, email_verified_at) VALUES
('Admin', 'User', 'admin@incide.com', '$2b$10$WWTim3jEKgr8L/1ea7H41.5Us1GlJIKMqVjEI3zgQYdbtlP6fehBG', TRUE, 1, NOW());

-- Sample Support User (password: Support123!)
INSERT INTO users (first_name, last_name, email, password, is_active, role_id, email_verified_at) VALUES
('Support', 'User', 'support@incide.com', '$2b$10$i2cAZpTn1BpjQ2zxDYOTUuNQHqCZXXLHUq2abKzzivmv9rBCk1pVi', TRUE, 2, NOW());

-- Sample Regular User (password: User123!)
INSERT INTO users (first_name, last_name, email, password, is_active, role_id, email_verified_at) VALUES
('John', 'Doe', 'john@example.com', '$2b$10$6xo6NzUq6za0Ms/RcMBXW.2Is6T/FOHsyebEbBQ2ihmqKdjyKGGuq', TRUE, 3, NOW());

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
