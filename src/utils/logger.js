import winston from "winston";

const isDevelopment = process.env.NODE_ENV !== "production";

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

// Development format: colorized, human-readable
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
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
  format: isDevelopment ? devFormat : prodFormat,
  transports,
});

export default logger;
