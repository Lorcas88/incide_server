import { Resend } from "resend";
import { config } from "../config/config.js";
import logger from "../utils/logger.js";

const resend = new Resend(config.emailSender.resend);

// Base email template
const createEmailTemplate = (title, content) => {
  return `
    <div style="background-color: #f9fafb; font-family: 'Inter', system-ui, sans-serif; padding: 40px 20px; color: #4b5563; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden;">
        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://i.imgur.com/wbvuXw6.png" alt="Logo" style="max-width: 150px; height: auto;" />
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 24px; margin-bottom: 0;">${title}</h2>
          </div>
          
          <div style="color: #4b5563; font-size: 16px;">
            ${content}
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">
              Gracias por usar <strong style="color: #0f172a;">Incide</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const sendConfirmationEmail = async (to, name, token) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === "test") {
    logger.info("Skipping email send in test environment", {
      type: "confirmation",
      to,
      name,
    });
    return { id: "test-email-id" };
  }

  try {
    const resetUrl = `${config.client.url}/confirm-email?token=${token}`;

    // Validate email recipient
    if (!to) {
      throw new Error("Faltan campos para el correo");
    }

    const content = `
      <div style="text-align: center;">
        <h3 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
          ¡Gracias por registrarte en Incide!
        </h3>
        <p style="margin-bottom: 32px; color: #4b5563;">
          Necesitas verificar tu dirección de correo para continuar usando tu
          cuenta de <b>Incide</b>. Ingresa el siguiente código para verificar tu
          dirección de correo:
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Confirma tu cuenta
        </a>
        <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "contacto_incide@resend.dev", // testing email
      to: to,
      subject: "Confirma tu cuenta en Incide",
      html: createEmailTemplate(`¡Hola, ${name}!`, content),
    });

    return result;
  } catch (error) {
    logger.error("Error sending confirmation email:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const sendForgotEmail = async (to, name, token) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === "test") {
    logger.info("Skipping email send in test environment", {
      type: "forgot-password",
      to,
      name,
    });
    return { id: "test-email-id" };
  }

  try {
    const resetUrl = `${config.client.url}/reset-password?token=${token}`;

    // Validate email recipient
    if (!to) {
      throw new Error("Faltan campos para el correo");
    }

    const content = `
      <div style="text-align: center;">
        <h3 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
          ¡Olvidaste tu contraseña!
        </h3>
        <p style="margin-bottom: 32px; color: #4b5563;">
          Enviamos este correo ya que olvidaste tu contraseña. Para ello
          debes hacer clic en el siguiente enlace e ingresar tu nueva contraseña:
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Reestablecer contraseña
        </a>
        <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "contacto_incide@resend.dev", // testing email of Resend
      to: to,
      subject: "Olvidaste tu contraseña en Incide",
      html: createEmailTemplate(`¡Hola, ${name}!`, content),
    });

    return result;
  } catch (error) {
    logger.error("Error sending forgot password email:", {
      message: error.message,
      stack: error.stack,
    });
    // Don't throw - email failure shouldn't break password reset flow
  }
};

export const sendTicketAssignedEmail = async (
  to,
  name,
  ticketId,
  ticketTitle,
) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === "test") {
    logger.info("Skipping email send in test environment", {
      type: "ticket-assigned",
      to,
      name,
      ticketId,
    });
    return { id: "test-email-id" };
  }

  try {
    if (!to) {
      throw new Error("Faltan campos para el correo");
    }

    const content = `
      <div style="text-align: center;">
        <h3 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
          Te han asignado un nuevo ticket
        </h3>
        <p style="margin-bottom: 32px; color: #4b5563;">
          Se te ha asignado el ticket <b>#${ticketId}</b>: "${ticketTitle}".
          Por favor revisa los detalles y comienza a trabajar en él.
        </p>
        <a href="${config.client.url}/tickets/${ticketId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Ver ticket
        </a>
      </div>
    `;

    const result = await resend.emails.send({
      from: "contacto_incide@resend.dev",
      to: to,
      subject: `Ticket #${ticketId} asignado - Incide`,
      html: createEmailTemplate(`¡Hola, ${name}!`, content),
    });

    return result;
  } catch (error) {
    logger.error("Error sending ticket assigned email:", {
      message: error.message,
      stack: error.stack,
    });
    // Don't throw - email failure shouldn't break the assignment
  }
};

export const sendTicketStatusChangedEmail = async (
  to,
  name,
  ticketId,
  ticketTitle,
  newStatus,
) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === "test") {
    logger.info("Skipping email send in test environment", {
      type: "ticket-status-changed",
      to,
      name,
      ticketId,
      newStatus,
    });
    return { id: "test-email-id" };
  }

  try {
    if (!to) {
      throw new Error("Faltan campos para el correo");
    }

    const statusNames = {
      1: "Abierto",
      2: "En progreso",
      3: "Cerrado",
    };

    const content = `
      <div style="text-align: center;">
        <h3 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
          Estado de tu ticket actualizado
        </h3>
        <p style="margin-bottom: 32px; color: #4b5563;">
          El estado del ticket <b>#${ticketId}</b>: "${ticketTitle}" 
          ha cambiado a <b>${statusNames[newStatus] || "Desconocido"}</b>.
        </p>
        <a href="${config.client.url}/tickets/${ticketId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Ver ticket
        </a>
      </div>
    `;

    const result = await resend.emails.send({
      from: "contacto_incide@resend.dev",
      to: to,
      subject: `Ticket #${ticketId} actualizado - Incide`,
      html: createEmailTemplate(`¡Hola, ${name}!`, content),
    });

    return result;
  } catch (error) {
    logger.error("Error sending ticket status changed email:", {
      message: error.message,
      stack: error.stack,
    });
    // Don't throw - email failure shouldn't break the status change
  }
};
