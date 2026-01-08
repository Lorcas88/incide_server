import BaseModel from "../../core/base.model.js";

class User extends BaseModel {
  static table = "users";

  static fillable = [
    "first_name",
    "last_name",
    "email",
    "password",
    "is_active",
    "role_id",
  ];
  static hidden = ["password", "role_id"];

  async all() {
    const sql = `
      SELECT ${this.table}.*, roles.name as role
      FROM ${this.table}
      LEFT JOIN roles ON ${this.table}.role_id = roles.id
    `;
    const [rows] = await this.pool.query(sql);
    return this.toArray(rows);
  }

  async find(id) {
    const sql = `
      SELECT ${this.table}.*, roles.name as role
      FROM ${this.table}
      LEFT JOIN roles ON ${this.table}.role_id = roles.id
      WHERE ${this.table}.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    const result = this.toArray(rows);
    return result[0] || null;
  }

  async findByEmail(email) {
    const sql = `
      SELECT *
      FROM ${this.table}
      WHERE email = ?
    `;
    const [result] = await this.pool.query(sql, [email]);
    return result[0] || null;
  }
}

export default User;
