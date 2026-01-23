import { TICKET_STATUS } from "./ticketStatus.constants.js";

// Valid status transitions
export const TicketWorkflow = {
  canTransition(from, to) {
    const transitions = {
      // Allow closed status from open, because if the problem was solved before support contact
      [TICKET_STATUS.OPEN]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.CLOSED],
      [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.RESOLVED],
      [TICKET_STATUS.RESOLVED]: [TICKET_STATUS.CLOSED],
      [TICKET_STATUS.CLOSED]: [],
    };

    return transitions[from]?.includes(to) ?? false;
  },
};
