import BaseModel from "../../core/base.model.js";

class PasswordReset extends BaseModel {
  static table = "password_reset_tokens";

  static fillable = ["user_id", "token_hash", "expires_at"];
  //   static hidden = ["password", "role_id"];

  async findByTokenHash(tokenHash) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.table}
       WHERE token_hash = ? AND used_at IS NULL`,
      [tokenHash],
    );
    return rows[0];
  }

  async markAsUsed(id) {
    return this.pool.query(
      `UPDATE ${this.table} SET used_at = NOW() WHERE id = ?`,
      [id],
    );
  }

  async deleteExpired() {
    return this.pool.query(
      `DELETE FROM ${this.table} WHERE expires_at < NOW()`,
    );
  }
}

export default PasswordReset;
