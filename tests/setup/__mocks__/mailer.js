// Mock the entire mailer module to prevent actual email sending
export const sendConfirmationEmail = jest
  .fn()
  .mockResolvedValue({ id: "mock-email-id" });
export const sendForgotEmail = jest
  .fn()
  .mockResolvedValue({ id: "mock-email-id" });
export const sendTicketAssignedEmail = jest
  .fn()
  .mockResolvedValue({ id: "mock-email-id" });
export const sendTicketStatusChangedEmail = jest
  .fn()
  .mockResolvedValue({ id: "mock-email-id" });
