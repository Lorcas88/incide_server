import { Resend } from "resend";
import { config } from "../config/config.js";

const resend = new Resend(config.emailSender.resend);

// Template base para emails
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

export const sendForgotEmail = async (to, name, token) => {
  try {
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
        <a href="http://localhost:3000/reset-password?token=${token}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Reestablecer contraseña
        </a>
        <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "contacto_incide@resend.dev", // Este es el email de prueba de Resend
      to: to,
      subject: "Olvidaste tu contraseña - Incide",
      html: createEmailTemplate(`¡Hola, ${name}!`, content),
    });

    return result;
  } catch (error) {
    console.error("Error:", error);
  }
};
