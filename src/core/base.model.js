import pool from "../config/db.js";

class BaseModel {
  constructor() {
    // table is written with the value of the instance
    this.table = this.constructor.table;
    this.pool = pool;

    // Internal properties
    this._select = [`${this.table}.*`];
    this._joins = [];
    this._wheres = [];
    this._bindings = [];

    // All queries exclude "deleted" records
    if (this.constructor.softDelete !== false) {
      this.where(`${this.table}.deleted_at IS NULL`);
    }
  }

  /* ---------------- QUERY BUILDER ---------------- */
  // Select constructor
  select(expr) {
    this._select.push(expr);
    return this;
  }

  // Left join constructor
  leftJoin(sql) {
    this._joins.push(sql);
    return this;
  }

  // where constructor
  where(sql, bindings = []) {
    this._wheres.push(sql);
    this._bindings.push(...bindings);
    return this;
  }

  // filter the wheres array, removing the "deleted_at" instruction
  withDeleted() {
    if (this.constructor.softDelete === false) return this;
    this._wheres = this._wheres.filter((w) => !w.includes("deleted_at"));
    return this;
  }

  // filter the wheres array, removing the "deleted_at" instruction
  // and add the instruction deleted_at IS NOT NULL
  onlyDeleted() {
    if (this.constructor.softDelete === false) return this;
    this._wheres = this._wheres.filter((w) => !w.includes("deleted_at"));
    this.where(`${this.table}.deleted_at IS NOT NULL`);
    return this;
  }

  buildQuery() {
    let sql = `
      SELECT ${this._select.join(", ")}
      FROM ${this.table}
      ${this._joins.join(" ")}
    `;

    if (this._wheres.length) {
      sql += " WHERE " + this._wheres.join(" AND ");
    }

    return sql;
  }

  reset() {
    this._select = [`${this.table}.*`];
    this._joins = [];
    this._wheres = [];
    this._bindings = [];

    // Restore default deleted_at filter
    if (this.constructor.softDelete !== false) {
      this.where(`${this.table}.deleted_at IS NULL`);
    }
  }

  async get() {
    const sql = this.buildQuery();
    const [rows] = await this.pool.query(sql, this._bindings);
    this.reset();
    return rows;
  }

  async first() {
    const rows = await this.get();
    return rows[0] || null;
  }

  /* ---------------- FILLABLE & FIND OR FAIL ---------------- */
  isFillable(data) {
    const fillable = this.constructor.fillable ?? [];
    if (!fillable.length) return data;

    return Object.fromEntries(
      Object.entries(data).filter(([key]) => fillable.includes(key)),
    );
  }

  /* ---------------- METHODS ---------------- */
  async all() {
    return this.get();
  }

  async find(id) {
    return this.findOne({ id });
  }

  async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    keys.forEach((key, index) => {
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        throw new Error("Invalid condition key");
      }
      this.where(`${this.table}.${key} = ?`, [values[index]]);
    });

    return this.first();
  }

  async create(data) {
    const filtered = this.isFillable(data);
    const columns = Object.keys(filtered).join(", ");
    const placeholders = Object.keys(filtered)
      .map(() => "?")
      .join(", ");
    const values = Object.values(filtered);

    const sql = `
        INSERT INTO ${this.table} (${columns})
        VALUES (${placeholders});
    `;

    const [result] = await pool.execute(sql, values);
    return await this.find(result.insertId);
  }

  async update(id, data) {
    const filtered = this.isFillable(data);
    if (!Object.keys(filtered).length) return null;

    const fields = Object.entries(filtered)
      .map(([key]) => `${key} = ?`)
      .join(",  ");

    const values = [...Object.values(filtered), id];

    const sql = `
        UPDATE ${this.table}
        SET ${fields}
        WHERE id = ?
      `;

    await pool.execute(sql, values);

    return this.find(id);
  }

  async delete(id) {
    let sql;
    if (this.constructor.softDelete === false) {
      sql = `DELETE FROM ${this.table} WHERE id = ?`;
    } else {
      sql = `UPDATE ${this.table} SET deleted_at = NOW() WHERE id = ?`;
    }

    await pool.execute(sql, [id]);
    return;
  }

  async restore(id) {
    const sql = `UPDATE ${this.table} SET deleted_at = NULL WHERE id = ?`;
    await pool.query(sql, [id]);
    return this.find(id);
  }
}

export default BaseModel;
