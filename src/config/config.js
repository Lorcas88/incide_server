export const config = {
  // Database
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true,
    // queueLimit: 0,
    // enableKeepAlive: true,
    // keepAliveInitialDelay: 0,
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    // environment: process.env.NODE_ENV || "development",
    // corsOrigins: process.env.CORS_ORIGINS || "http://localhost",
    // frontendPort: process.env.FRONTEND_PORT,
    // host: process.env.HOST || "127.0.0.1",
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRES_IN || "1h",
    // passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS),
    // rateLimit: {
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   maxAttempts: 10,
    //   authWindowMs: 5 * 60 * 1000, // 5 minutes for auth endpoints
    //   authMaxAttempts: 5,
    // },
    // bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
  },
};
