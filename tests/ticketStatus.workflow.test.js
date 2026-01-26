import { TicketWorkflow } from "../src/modules/ticket-status/ticketStatus.workflow.js";
import { TICKET_STATUS } from "../src/modules/ticket-status/ticketStatus.constants.js";

describe("TicketWorkflow", () => {
  describe("canTransition", () => {
    // OPEN transitions
    it("should allow transition from OPEN to IN_PROGRESS", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.OPEN,
        TICKET_STATUS.IN_PROGRESS,
      );

      expect(result).toBe(true);
    });

    it("should allow transition from OPEN to CLOSED (auto-resolved)", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.OPEN,
        TICKET_STATUS.CLOSED,
      );

      expect(result).toBe(true);
    });

    it("should deny transition from OPEN to RESOLVED (must go through IN_PROGRESS)", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.OPEN,
        TICKET_STATUS.RESOLVED,
      );

      expect(result).toBe(false);
    });

    // IN_PROGRESS transitions
    it("should allow transition from IN_PROGRESS to RESOLVED", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.IN_PROGRESS,
        TICKET_STATUS.RESOLVED,
      );

      expect(result).toBe(true);
    });

    it("should allow transition from IN_PROGRESS back to OPEN (need more info)", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.IN_PROGRESS,
        TICKET_STATUS.OPEN,
      );

      expect(result).toBe(true);
    });

    it("should deny transition from IN_PROGRESS to CLOSED (must go through RESOLVED)", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.IN_PROGRESS,
        TICKET_STATUS.CLOSED,
      );

      expect(result).toBe(false);
    });

    // RESOLVED transitions
    it("should allow transition from RESOLVED to CLOSED", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.RESOLVED,
        TICKET_STATUS.CLOSED,
      );

      expect(result).toBe(true);
    });

    it("should allow transition from RESOLVED to IN_PROGRESS (not really resolved)", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.RESOLVED,
        TICKET_STATUS.IN_PROGRESS,
      );

      expect(result).toBe(true);
    });

    it("should deny transition from RESOLVED to OPEN", () => {
      const result = TicketWorkflow.canTransition(
        TICKET_STATUS.RESOLVED,
        TICKET_STATUS.OPEN,
      );

      expect(result).toBe(false);
    });

    // CLOSED transitions
    it("should deny transition from CLOSED to any status", () => {
      const resultToOpen = TicketWorkflow.canTransition(
        TICKET_STATUS.CLOSED,
        TICKET_STATUS.OPEN,
      );
      const resultToInProgress = TicketWorkflow.canTransition(
        TICKET_STATUS.CLOSED,
        TICKET_STATUS.IN_PROGRESS,
      );
      const resultToResolved = TicketWorkflow.canTransition(
        TICKET_STATUS.CLOSED,
        TICKET_STATUS.RESOLVED,
      );

      expect(resultToOpen).toBe(false);
      expect(resultToInProgress).toBe(false);
      expect(resultToResolved).toBe(false);
    });

    // Same status (idempotence/safety)
    it("should allow staying in the same status for safety", () => {
      const resultOpen = TicketWorkflow.canTransition(
        TICKET_STATUS.OPEN,
        TICKET_STATUS.OPEN,
      );
      const resultInProgress = TicketWorkflow.canTransition(
        TICKET_STATUS.IN_PROGRESS,
        TICKET_STATUS.IN_PROGRESS,
      );
      const resultResolved = TicketWorkflow.canTransition(
        TICKET_STATUS.RESOLVED,
        TICKET_STATUS.RESOLVED,
      );
      const resultClosed = TicketWorkflow.canTransition(
        TICKET_STATUS.CLOSED,
        TICKET_STATUS.CLOSED,
      );

      expect(resultOpen).toBe(true);
      expect(resultInProgress).toBe(true);
      expect(resultResolved).toBe(true);
      expect(resultClosed).toBe(true);
    });

    // Invalid status handling
    it("should handle invalid status IDs gracefully", () => {
      const result = TicketWorkflow.canTransition(999, 1);

      expect(result).toBe(false);
    });
  });
});
