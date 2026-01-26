import { ROLES } from "../roles/role.constants.js";

export const TicketPolicy = {
  view(user, ticket) {
    // If user has admin role, can view all tickets
    if (user.role_id === ROLES.ADMIN) return true;

    // If user has support role, only can view assingned tickets to him
    if (user.role_id === ROLES.SUPPORT && ticket.assigned_to === user.id) {
      return true;
    }

    // If user has user role, only can look created tickets by him
    if (user.role_id === ROLES.USER && ticket.created_by === user.id) {
      return true;
    }

    return false;
  },

  create(user) {
    // If user has user or admin role, can create tickets
    return user.role_id === ROLES.ADMIN || user.role_id === ROLES.USER;
  },

  update(user, ticket) {
    if (user.role_id === ROLES.ADMIN) return true;

    // If user has support role and it's assigned to him, can update the ticket
    if (user.role_id === ROLES.SUPPORT && ticket.assigned_to === user.id) {
      return true;
    }

    return false;
  },

  canBeAssignedTo(user) {
    // Support and Admin can be assigned to tickets
    return user.role_id === ROLES.SUPPORT || user.role_id === ROLES.ADMIN;
  },

  canAssign(actor) {
    // Admin and Support can assign tickets
    return actor.role_id === ROLES.ADMIN || actor.role_id === ROLES.SUPPORT;
  },

  canSelfAssign(actor, ticket) {
    // if the logged user has support role and the ticket is not asigned
    return actor.role_id === ROLES.SUPPORT && ticket.assigned_to === null;
  },

  canChangeStatus(actor, ticket) {
    if (actor.role_id === ROLES.ADMIN) return true;

    if (actor.role_id === ROLES.SUPPORT && ticket.assigned_to === actor.id) {
      return true;
    }

    return false;
  },

  delete(user) {
    return user.role_id === ROLES.ADMIN;
  },
};
