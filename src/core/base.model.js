import pool from "../config/db.js";

class BaseModel {
  //   constructor() {
  //     this.table = table;
  //   }
  constructor() {
    this.table = this.constructor.table;
    this.pool = pool;
  }

  isFillable(data) {
    const { fillable } = this.constructor;
    if (!Array.isArray(fillable)) return data;

    const filtered = {};
    // Turn into an array, then iterates it to validate if a key of data
    // is included in the fillable array to finally save it in the filtered object
    Object.entries(data).forEach(([key, value]) => {
      if (fillable.includes(key)) {
        filtered[key] = value;
      }
    });
    return filtered;
  }

  toArray(data) {
    const { hidden } = this.constructor;
    if (!Array.isArray(hidden) || !Array.isArray(data)) return data;

    // Iterates the data and clone it into newItem with Spread, to avoid pointing
    // the same object. Then, hidden is iterated to mutate values on newItem
    return data.map((item) => {
      const newItem = { ...item };
      hidden.forEach((field) => delete newItem[field]);
      return newItem;
    });
  }

  async all() {
    const sql = `SELECT * FROM ${this.table}`;
    const [result] = await pool.query(sql);
    // return result;
    return this.toArray(result);
  }

  async find(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);
    // return result[0] || null;
    const hidden = this.toArray(result);
    return hidden[0] || null;
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
    if (Object.keys(filtered).length === 0) return null;

    const fields = Object.entries(filtered)
      .map(([key]) => `${key} = ?`)
      .join(",  ");
    const values = Object.values(filtered);

    const sql = `
        UPDATE ${this.table}
        SET ${fields}
        WHERE id = ?
      `;

    await pool.execute(sql, [...values, id]);

    return this.find(id);
  }

  async delete(id) {
    const sql = `DELETE FROM ${this.table} WHERE id = ?`;
    await pool.query(sql, [id]);
    return;
  }
}

export default BaseModel;
