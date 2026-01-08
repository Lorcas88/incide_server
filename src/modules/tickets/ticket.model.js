import BaseModel from "../../core/base.model.js";

class Ticket extends BaseModel {
  static table = "tickets";
  static fillable = ["title", "description", "created_by", "ticket_status_id"];
  static hidden = ["created_by"];
}

export default Ticket;
