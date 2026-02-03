-- ============================================
-- SAMPLE DATA (For Development Only)
-- ============================================

-- Sample Admin User (password: Admin123!)
INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at) VALUES
('Admin', 'User', 'admin@incide.com', '$2b$10$WWTim3jEKgr8L/1ea7H41.5Us1GlJIKMqVjEI3zgQYdbtlP6fehBG', 1, NOW());

-- Sample Support User (password: Support123!)
INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at) VALUES
('Support', 'User', 'support@incide.com', '$2b$10$i2cAZpTn1BpjQ2zxDYOTUuNQHqCZXXLHUq2abKzzivmv9rBCk1pVi', 2, NOW());

-- Sample Regular User (password: User123!)
INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at) VALUES
('John', 'Doe', 'john@example.com', '$2b$10$6xo6NzUq6za0Ms/RcMBXW.2Is6T/FOHsyebEbBQ2ihmqKdjyKGGuq', 3, NOW());
