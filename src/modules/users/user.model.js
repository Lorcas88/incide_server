import BaseModel from "../../core/base.model.js";

class User extends BaseModel {
  static table = "users";

  static fillable = [
    "first_name",
    "last_name",
    "email",
    "password",
    "role_id",
    "email_verified_at",
    "deleted_at",
    "failed_login_attempts",
    "locked_at",
    "locked_until",
  ];

  withRole() {
    return this.select("roles.name AS role").leftJoin(
      `LEFT JOIN roles ON ${this.table}.role_id = roles.id`,
    );
  }

  findByEmail(email) {
    return this.where("users.email = ?", [email]).first();
  }

  async verifyEmail(id) {
    return this.pool.query(
      `UPDATE ${this.table} SET email_verified_at = NOW() WHERE id = ?`,
      [id],
    );
  }
}

export default User;
