import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// Set default env vars for testing if not present
process.env.PORT = process.env.PORT || "3000";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_USER = process.env.DB_USER || "incide_user";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "P@ssw0rd_2714";
process.env.DB_NAME = process.env.DB_NAME || "incide_db";
process.env.DB_PORT = process.env.DB_PORT || "3307";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_123";
