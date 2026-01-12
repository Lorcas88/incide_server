import BaseModel from "../../core/base.model.js";

class Ticket extends BaseModel {
  static table = "tickets";
  static fillable = ["title", "description", "created_by", "ticket_status_id"];
  static hidden = ["created_by"];

  async findByIdRaw(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = ?`;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }
}

export default Ticket;
