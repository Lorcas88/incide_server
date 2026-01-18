import BaseModel from "../../core/base.model.js";

class Ticket extends BaseModel {
  static table = "tickets";
  static fillable = ["title", "description", "created_by", "ticket_status_id"];
  static hidden = ["created_by"];

  async findAllByUserId(userId) {
    const sql = `SELECT * FROM ${this.table} WHERE created_by = ?`;
    const [result] = await this.pool.query(sql, [userId]);
    return this.toArray(result);
  }

  async findByIdRaw(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result[0] || null;
  }
}

export default Ticket;
