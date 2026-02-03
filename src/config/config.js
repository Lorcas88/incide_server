/**
 * Environment Configuration with Validation
 *
 * This module loads and validates environment variables based on NODE_ENV.
 * Validation runs on module load to catch configuration errors early.
 */

// Detect environment
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";
const isDevelopment = NODE_ENV === "development";

/**
 * Validates that all required environment variables are present and valid
 * @throws {Error} If validation fails
 */
function validateConfig() {
  const errors = [];

  // Required variables for all environments
  const requiredVars = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "DB_PORT",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "BCRYPT_ROUNDS",
    "FRONTEND_URL",
  ];

  // Additional required variables for production
  if (isProduction) {
    requiredVars.push("RESEND_API_KEY");
  }

  // Check for missing required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Data type validation
  if (process.env.DB_PORT && isNaN(parseInt(process.env.DB_PORT))) {
    errors.push(
      `DB_PORT must be a valid number (got: "${process.env.DB_PORT}")`,
    );
  }

  if (process.env.BCRYPT_ROUNDS) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS);
    if (isNaN(rounds)) {
      errors.push(
        `BCRYPT_ROUNDS must be a valid number (got: "${process.env.BCRYPT_ROUNDS}")`,
      );
    } else if (rounds < 10 || rounds > 15) {
      errors.push(
        `BCRYPT_ROUNDS should be between 10-15 for security and performance (got: ${rounds})`,
      );
    }
  }

  // Security validation for production
  if (isProduction && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      errors.push(
        `JWT_SECRET must be at least 32 characters in production (current length: ${process.env.JWT_SECRET.length})`,
      );
    }
    if (process.env.JWT_SECRET.length < 64) {
      errors.push(
        `WARNING: JWT_SECRET should be at least 64 characters for production (current length: ${process.env.JWT_SECRET.length})`,
      );
    }
  }

  // Validate JWT_SECRET minimum length for all environments
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    errors.push(
      `JWT_SECRET is too short (minimum 16 characters, got: ${process.env.JWT_SECRET.length})`,
    );
  }

  // Display errors if any
  if (errors.length > 0) {
    console.error("\n");
    console.error(
      "═══════════════════════════════════════════════════════════════",
    );
    console.error(`Configuration Error (${NODE_ENV} environment)`);
    console.error(
      "═══════════════════════════════════════════════════════════════",
    );
    console.error("\n");
    errors.forEach((error) => console.error(`  ${error}`));
    console.error("\n");
    console.error("  Tips:");
    console.error(`     - Check your .env.${NODE_ENV} file`);
    console.error("     - See .env.example for reference");
    console.error("     - Generate a strong JWT_SECRET with:");
    console.error(
      "       node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
    );
    console.error("\n");
    console.error(
      "═══════════════════════════════════════════════════════════════",
    );
    console.error("\n");

    throw new Error(
      "Configuration validation failed. Please fix the errors above.",
    );
  }

  // Success message
  console.log(
    `\n  Configuration validated successfully (${NODE_ENV} environment)\n`,
  );
}

// Run validation
validateConfig();

// Export validated configuration
export const config = {
  env: {
    nodeEnv: NODE_ENV,
    isProduction,
    isDevelopment,
    isTest,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    connectionLimit: 10,
    waitForConnections: true,
  },
  server: {
    port: process.env.PORT || 3000,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRES_IN || "1h",
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
  },
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  cookies: {
    httpOnly: true,
    secure: isProduction, // Only secure cookies in production
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
  emailSender: {
    resend: process.env.RESEND_API_KEY || (isTest ? "re_test_key" : undefined),
  },
  client: {
    url: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};
