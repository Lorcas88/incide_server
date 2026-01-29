import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// Set default env vars for testing if not present
if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = "re_123456789";
}
