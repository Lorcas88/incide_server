import BaseModel from "../../core/base.model.js";

class Ticket extends BaseModel {
  static table = "tickets";
  static fillable = ["title", "description", "created_by", "ticket_status_id"];
  static hidden = ["created_by"];

  async findByCreator(userId) {
    const sql = `SELECT * FROM ${this.table} WHERE created_by = ?`;
    const [rows] = await this.pool.query(sql, [userId]);
    return this.toArray(rows);
  }
}

export default Ticket;
