import winston from "winston";

const isDevelopment = process.env.NODE_ENV !== "production";
const isTesting = process.env.NODE_ENV === "test";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Test format: minimal, only essential error info
const testFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { level, message, code, status } = info;

    // Base log message
    let logMessage = `${level}: ${message}`;

    // Add error code and status if present
    if (code || status) {
      const errorInfo = [];
      if (code) errorInfo.push(`code: ${code}`);
      if (status) errorInfo.push(`status: ${status}`);
      logMessage += ` [${errorInfo.join(", ")}]`;
    }

    return logMessage;
  }),
);

// Development format: colorized, human-readable
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, code, status, ...meta } = info;

    // Base log message
    let logMessage = `${timestamp} ${level}: ${message}`;

    // Add error code and status if present
    if (code || status) {
      const errorInfo = [];
      if (code) errorInfo.push(`code: ${code}`);
      if (status) errorInfo.push(`status: ${status}`);
      logMessage += ` [${errorInfo.join(", ")}]`;
    }

    // Add remaining metadata if present
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  }),
);

// Production format: JSON for log aggregators
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports = [
  // Console output
  new winston.transports.Console(),
  // Error logs
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  // Combined logs
  new winston.transports.File({
    filename: "logs/combined.log",
  }),
];

const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  levels,
  format: isTesting ? testFormat : isDevelopment ? devFormat : prodFormat,
  transports,
});

export default logger;
