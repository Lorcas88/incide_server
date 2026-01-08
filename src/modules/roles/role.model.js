import BaseModel from "../../core/base.model.js";

class Role extends BaseModel {
  static table = "roles";

  static fillable = ["name"];
  static hidden = ["id"];

  //   async find(id) {
  //     const sql = `
  //     SELECT *
  //     FROM ${this.table}
  //     WHERE id = ?
  //   `;

  //     const [rows] = await this.pool.query(sql, [id]);
  //     return rows[0] || null;
  //   }
}

export default Role;
