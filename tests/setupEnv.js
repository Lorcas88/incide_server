import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// Set default environment variables for testing if not present
process.env.PORT = process.env.PORT || "3000";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_123456789";
process.env.NODE_ENV = "test";
