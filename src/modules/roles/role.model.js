import BaseModel from "../../core/base.model.js";

class Role extends BaseModel {
  static table = "roles";

  static fillable = ["name"];
  static hidden = ["id"];

  async findByName(name) {
    const sql = `
      SELECT *
      FROM ${this.table}
      WHERE name = ?
    `;
    const [rows] = await this.pool.query(sql, [name]);
    return rows[0] || null;
  }
}

export default Role;
