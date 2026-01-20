import BaseModel from "../../core/base.model.js";

class Role extends BaseModel {
  static table = "roles";

  static fillable = ["name"];
  static hidden = ["id"];
}

export default Role;
