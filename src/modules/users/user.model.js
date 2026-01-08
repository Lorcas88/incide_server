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

  async findByEmail(email) {
    const sql = `
    SELECT *
    FROM ${this.table}
    WHERE email = ?
  `;

    const [rows] = await this.pool.query(sql, [email]);
    return rows[0] || null;
  }
}

export default User;
