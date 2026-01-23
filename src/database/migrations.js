import fs from "fs";
import path from "path";
import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const runMigrations = async () => {
  const schemaPath = path.resolve("src/database/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  try {
    logger.info("Ejecutando migraciones...");
    await pool.query(sql);
    logger.info("Migraciones ejecutadas exitosamente");
    process.exit(0);
  } catch (err) {
    logger.error("Error ejecutando migraciones:", {
      code: err.code,
      message: err.sqlMessage || err.message,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

await runMigrations();
