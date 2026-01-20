import BaseModel from "../../core/base.model.js";

class Ticket extends BaseModel {
  static table = "tickets";
  static fillable = [
    "title",
    "description",
    "created_by",
    "assigned_to",
    "ticket_status_id",
  ];

  async allAssignedToUser(userId) {
    const sql = `SELECT * FROM ${this.table} WHERE assigned_to = ?`;
    const [result] = await this.pool.query(sql, [userId]);
    return result;
  }

  async withoutAssignment() {
    const sql = `SELECT * FROM ${this.table} WHERE assigned_to IS NULL`;
    const [result] = await this.pool.query(sql);
    return result;
  }

  async allByUser(userId) {
    const sql = `SELECT * FROM ${this.table} WHERE created_by = ?`;
    const [result] = await this.pool.query(sql, [userId]);
    return result;
  }
}

export default Ticket;
