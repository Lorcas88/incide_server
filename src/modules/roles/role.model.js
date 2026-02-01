import BaseModel from "../../core/base.model.js";

class Role extends BaseModel {
  static table = "roles";

  static fillable = ["name"];

  // Override find to not filter by deleted_at since this table doesn't have soft deletes
  async find(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = ?`;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }
}

export default Role;
