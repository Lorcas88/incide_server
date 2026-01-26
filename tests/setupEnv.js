import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// Set default env vars for testing if not present
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_123";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_USER = process.env.DB_USER || "test";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "test";
process.env.DB_NAME = process.env.DB_NAME || "incide_test";
process.env.DB_PORT = process.env.DB_PORT || "3306";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
