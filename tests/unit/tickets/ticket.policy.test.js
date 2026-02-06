import { TicketPolicy } from "../../../src/modules/tickets/ticket.policy.js";
import { ROLES } from "../../../src/modules/roles/role.constants.js";

describe("TicketPolicy", () => {
  describe("view", () => {
    it("should allow user to view their own ticket", () => {
      const user = { id: 1, role_id: ROLES.USER };
      const ticket = { created_by: 1 };

      expect(TicketPolicy.view(user, ticket)).toBe(true);
    });

    it("should deny user from viewing other users tickets", () => {
      const user = { id: 1, role_id: ROLES.USER };
      const ticket = { created_by: 2 };

      expect(TicketPolicy.view(user, ticket)).toBe(false);
    });

    it("should allow admin to view any ticket", () => {
      const admin = { id: 1, role_id: ROLES.ADMIN };
      const ticket = { created_by: 999 };

      expect(TicketPolicy.view(admin, ticket)).toBe(true);
    });

    it("should allow support to view assigned tickets", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };
      const ticket = { created_by: 1, assigned_to: 5 };

      expect(TicketPolicy.view(support, ticket)).toBe(true);
    });

    it("should deny support from viewing unassigned tickets", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };
      const ticket = { created_by: 1, assigned_to: null };

      expect(TicketPolicy.view(support, ticket)).toBe(false);
    });

    it("should deny support from viewing tickets assigned to others", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };
      const ticket = { created_by: 1, assigned_to: 6 };

      expect(TicketPolicy.view(support, ticket)).toBe(false);
    });
  });

  describe("update", () => {
    it("should deny user from updating their own tickets", () => {
      const user = { id: 1, role_id: ROLES.USER };
      const ticket = { created_by: 1, assigned_to: null };

      expect(TicketPolicy.update(user, ticket)).toBe(false);
    });

    it("should allow admin to update tickets", () => {
      const admin = { id: 1, role_id: ROLES.ADMIN };
      const ticket = { created_by: 2, assigned_to: null };

      expect(TicketPolicy.update(admin, ticket)).toBe(true);
    });

    it("should allow support to update assigned tickets", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };
      const ticket = { created_by: 1, assigned_to: 5 };

      expect(TicketPolicy.update(support, ticket)).toBe(true);
    });

    it("should deny support from updating unassigned tickets", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };
      const ticket = { created_by: 1, assigned_to: null };

      expect(TicketPolicy.update(support, ticket)).toBe(false);
    });
  });

  describe("delete", () => {
    it("should deny user from deleting tickets", () => {
      const user = { id: 1, role_id: ROLES.USER };

      expect(TicketPolicy.delete(user)).toBe(false);
    });

    it("should deny support from deleting tickets", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };

      expect(TicketPolicy.delete(support)).toBe(false);
    });

    it("should allow admin to delete tickets", () => {
      const admin = { id: 1, role_id: ROLES.ADMIN };

      expect(TicketPolicy.delete(admin)).toBe(true);
    });
  });

  describe("canAssign", () => {
    it("should deny user from assigning tickets", () => {
      const user = { id: 1, role_id: ROLES.USER };
      const ticket = { created_by: 1 };

      expect(TicketPolicy.canAssign(user, ticket)).toBe(false);
    });

    it("should allow admin to assign tickets", () => {
      const admin = { id: 1, role_id: ROLES.ADMIN };
      const ticket = { created_by: 2 };

      expect(TicketPolicy.canAssign(admin, ticket)).toBe(true);
    });

    it("should deny support from assigning tickets", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };
      const ticket = { created_by: 1 };

      expect(TicketPolicy.canAssign(support, ticket)).toBe(false);
    });
  });

  describe("canBeAssignedTo", () => {
    it("should deny assigning to regular user", () => {
      const user = { id: 1, role_id: ROLES.USER };

      expect(TicketPolicy.canBeAssignedTo(user)).toBe(false);
    });

    it("should allow assigning to support user", () => {
      const support = { id: 5, role_id: ROLES.SUPPORT };

      expect(TicketPolicy.canBeAssignedTo(support)).toBe(true);
    });

    it("should allow assigning to admin user", () => {
      const admin = { id: 1, role_id: ROLES.ADMIN };

      expect(TicketPolicy.canBeAssignedTo(admin)).toBe(true);
    });
  });
});
