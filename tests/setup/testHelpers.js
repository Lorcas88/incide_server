import bcrypt from "bcrypt";
import pool from "../../src/config/db.js";
import { ROLES } from "../../src/modules/roles/role.constants.js";
import { config } from "../../src/config/config.js";
import request from "supertest";
import app from "../../src/app.js";

/**
 * Clean all test data from database
 */
export const cleanDatabase = async () => {
  await pool.query("TRUNCATE TABLE tickets");
  await pool.query("TRUNCATE TABLE refresh_tokens");
  await pool.query("DELETE FROM user_tokens");
  await pool.query("DELETE FROM users");
  await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");
};

/**
 * Create a test user with specified role
 * @param {Object} userData - User data
 * @param {string} userData.first_name
 * @param {string} userData.last_name
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {number} userData.role_id - Role ID (default: ROLES.USER)
 * @param {boolean} userData.verified - Whether email is verified (default: true)
 * @returns {Promise<{id: number, ...userData}>}
 */
export const createTestUser = async ({
  first_name = "Test",
  last_name = "User",
  email = `test${Date.now()}@example.com`,
  password = "Test123!",
  role_id = ROLES.USER,
  verified = true,
} = {}) => {
  const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

  const [result] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
     VALUES (?, ?, ?, ?, ?, ${verified ? "NOW()" : "NULL"})`,
    [first_name, last_name, email, hashedPassword, role_id],
  );

  return {
    id: result.insertId,
    first_name,
    last_name,
    email,
    password, // Return plain password for login tests
    role_id,
  };
};

/**
 * Get authentication token for a user
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<string>} JWT token
 */
export const getAuthToken = async ({ email, password }) => {
  const res = await request(app).post("/api/v1/auth/login").send({
    email,
    password,
  });

  if (res.status !== 200) {
    throw new Error(
      `Failed to get auth token: ${res.status} - ${JSON.stringify(res.body)}`,
    );
  }

  return res.body.data.token;
};

/**
 * Create a test user and get their auth token
 * @param {Object} userData - User data (same as createTestUser)
 * @returns {Promise<{user: Object, token: string}>}
 */
export const createAuthenticatedUser = async (userData = {}) => {
  const user = await createTestUser({ verified: true, ...userData });
  const token = await getAuthToken({
    email: user.email,
    password: user.password,
  });

  return { user, token };
};

/**
 * Create test users for different roles
 * @returns {Promise<{admin: {user, token}, support: {user, token}, user: {user, token}}>}
 */
export const createTestUsers = async () => {
  const admin = await createAuthenticatedUser({
    first_name: "Admin",
    last_name: "User",
    email: "admin@test.com",
    password: "Admin123!",
    role_id: ROLES.ADMIN,
  });

  const support = await createAuthenticatedUser({
    first_name: "Support",
    last_name: "User",
    email: "support@test.com",
    password: "Support123!",
    role_id: ROLES.SUPPORT,
  });

  const user = await createAuthenticatedUser({
    first_name: "Regular",
    last_name: "User",
    email: "user@test.com",
    password: "User123!",
    role_id: ROLES.USER,
  });

  return { admin, support, user };
};

/**
 * Create a test ticket
 * @param {Object} ticketData
 * @param {number} ticketData.created_by - User ID who created the ticket
 * @param {string} ticketData.title
 * @param {string} ticketData.description
 * @param {number} ticketData.assigned_to - User ID assigned to (optional)
 * @param {number} ticketData.ticket_status_id - Status ID (default: 1 - OPEN)
 * @returns {Promise<{id: number, ...ticketData}>}
 */
export const createTestTicket = async ({
  created_by,
  title = "Test Ticket",
  description = "Test ticket description",
  assigned_to = null,
  ticket_status_id = 1,
} = {}) => {
  if (!created_by) {
    throw new Error("created_by is required for createTestTicket");
  }

  const [result] = await pool.query(
    `INSERT INTO tickets (title, description, created_by, assigned_to, ticket_status_id)
     VALUES (?, ?, ?, ?, ?)`,
    [title, description, created_by, assigned_to, ticket_status_id],
  );

  return {
    id: result.insertId,
    title,
    description,
    created_by,
    assigned_to,
    ticket_status_id,
  };
};
