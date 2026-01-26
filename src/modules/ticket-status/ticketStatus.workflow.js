import { TICKET_STATUS } from "./ticketStatus.constants.js";

// Valid status transitions
export const TicketWorkflow = {
  canTransition(from, to) {
    // Allow staying in same status (safety/idempotence)
    if (from === to) return true;

    const transitions = {
      // OPEN can go to IN_PROGRESS or CLOSED (if auto-resolved)
      [TICKET_STATUS.OPEN]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.CLOSED],
      // IN_PROGRESS can go to RESOLVED or back to OPEN (need more info)
      [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.RESOLVED, TICKET_STATUS.OPEN],
      // RESOLVED can go to CLOSED or back to IN_PROGRESS (not really resolved)
      [TICKET_STATUS.RESOLVED]: [
        TICKET_STATUS.CLOSED,
        TICKET_STATUS.IN_PROGRESS,
      ],
      // CLOSED is final
      [TICKET_STATUS.CLOSED]: [],
    };

    return transitions[from]?.includes(to) ?? false;
  },
};
