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
    "email_verified_at",
    "deleted_at",
  ];

  withRole() {
    return this.select("roles.name AS role").leftJoin(
      `LEFT JOIN roles ON ${this.table}.role_id = roles.id`,
    );
  }

  findByEmail(email) {
    return this.where("users.email = ?", [email]).first();
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
