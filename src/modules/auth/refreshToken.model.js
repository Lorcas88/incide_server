import BaseModel from "../../core/base.model.js";

class RefreshToken extends BaseModel {
  static table = "refresh_tokens";

  static fillable = ["user_id", "token_hash", "expires_at"];
  //   static hidden = ["password", "role_id"];

  async findByTokenHash(tokenHash) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.table}
       WHERE token_hash = ? AND revoked_at IS NULL`,
      [tokenHash],
    );
    return rows[0];
  }

  async revoke(id) {
    return this.pool.query(
      `UPDATE ${this.table} SET revoked_at = NOW() WHERE id = ?`,
      [id],
    );
  }

  async revokeAllForUser(userId) {
    return this.pool.query(
      `UPDATE ${this.table} SET revoked_at = NOW()
       WHERE user_id = ? AND revoked_at IS NULL`,
      [userId],
    );
  }

  async deleteExpired() {
    return this.pool.query(
      `DELETE FROM ${this.table} WHERE expires_at < NOW()`,
    );
  }
}

export default RefreshToken;
