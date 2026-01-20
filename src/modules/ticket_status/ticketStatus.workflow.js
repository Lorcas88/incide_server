import { TICKET_STATUS } from "./ticketStatus.constants.js";

// Valid status transitions
export const TicketWorkflow = {
  canTransition(from, to) {
    const transitions = {
      [TICKET_STATUS.OPEN]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.CLOSED],
      [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.RESOLVED],
      [TICKET_STATUS.RESOLVED]: [TICKET_STATUS.CLOSED],
      [TICKET_STATUS.CLOSED]: [],
    };

    return transitions[from]?.includes(to) ?? false;
  },
};
