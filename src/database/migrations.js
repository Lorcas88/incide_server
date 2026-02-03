import fs from "fs";
import path from "path";
import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const runMigrations = async () => {
  const schemaPath = path.resolve("src/database/schema.sql");
  const seedsPath = path.resolve("src/database/seeds.sql");

  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  try {
    logger.info("Ejecutando migraciones de esquema...");
    await pool.query(schemaSql);

    // Only run seeds if NOT in test environment
    if (process.env.NODE_ENV !== "test") {
      const seedsSql = fs.readFileSync(seedsPath, "utf8");
      logger.info("Ejecutando migraciones de datos (seeds)...");
      await pool.query(seedsSql);
    } else {
      logger.info("Saltando seeds en entorno de prueba.");
    }

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
