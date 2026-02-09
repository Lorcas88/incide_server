import BaseModel from "../../core/base.model.js";

class UserToken extends BaseModel {
  static table = "user_tokens";
  static softDelete = false; // Uses hard delete

  static fillable = ["user_id", "type", "token_hash", "expires_at"];
  static hidden = [];

  async findByTokenHash(tokenHash) {
    return this.where("token_hash = ?", [tokenHash]).first();
  }

  async invalidateAllByType(userId, type) {
    const sql = `DELETE FROM ${this.table} WHERE user_id = ? AND type = ?`;
    const [result] = await this.pool.execute(sql, [userId, type]);
    return result.affectedRows;
  }

  async deleteExpired() {
    const sql = `DELETE FROM ${this.table} WHERE expires_at < NOW()`;
    const [result] = await this.pool.execute(sql);
    return result.affectedRows;
  }
}

export default UserToken;
