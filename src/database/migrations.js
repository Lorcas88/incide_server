import fs from "fs";
import path from "path";
import pool from "../config/db.js";

export const runMigrations = async () => {
  const schemaPath = path.resolve("src/database/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  try {
    console.log("Ejecutando migraciones...");
    await pool.query(sql);
    console.log("Migraciones ejecutadas exitosamente");
    process.exit(0);
  } catch (err) {
    console.error("Error ejecutando migraciones:");
    console.error("Código:", err.code);
    console.error("Mensaje:", err.sqlMessage || err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

await runMigrations();
