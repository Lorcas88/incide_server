import BaseModel from "../../core/base.model.js";

class TicketStatus extends BaseModel {
  static table = "ticket_status";

  static fillable = ["name"];
}

export default TicketStatus;
