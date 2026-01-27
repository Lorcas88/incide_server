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

  async all() {
    const sql = `
      SELECT ${this.table}.*, roles.name as role
      FROM ${this.table}
      LEFT JOIN roles ON ${this.table}.role_id = roles.id
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  async find(id) {
    const sql = `
      SELECT ${this.table}.*, roles.name as role
      FROM ${this.table}
      LEFT JOIN roles ON ${this.table}.role_id = roles.id
      WHERE ${this.table}.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const sql = `
      SELECT *
      FROM ${this.table}
      WHERE email = ?
    `;
    const [rows] = await this.pool.query(sql, [email]);
    return rows[0] || null;
  }

  // async isUserVerified(email) {
  //   const sql = `
  //     SELECT *
  //     FROM ${this.table}
  //     WHERE email = ? AND email_verified_at IS NOT NULL
  //   `;
  //   const [rows] = await this.pool.query(sql, [email]);
  //   return rows[0] || null;
  // }

  // async changeVerifiedStatus(id) {
  //   return this.pool.query(
  //     `UPDATE ${this.table} SET email_verified_at = NOW() WHERE id = ?`,
  //     [id],
  //   );
  // }

  async verifyEmail(id) {
    return this.pool.query(
      `UPDATE ${this.table} SET email_verified_at = NOW() WHERE id = ?`,
      [id],
    );
  }
}

export default User;
