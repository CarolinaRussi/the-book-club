import { Resend } from "resend";
import {
  EmailConfigError,
  getEmailFrom,
  getResendApiKey,
} from "../utils/emailConfig";

export class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailSendError";
  }
}

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getResendApiKey());
  }
  return resendClient;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const { data, error } = await getResendClient().emails.send({
    from: getEmailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    throw new EmailSendError(error.message);
  }

  if (!data?.id) {
    throw new EmailSendError("Resend não retornou id do e-mail");
  }

  return { id: data.id };
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<{ id: string }> {
  return sendEmail({
    to: to.trim(),
    subject: "Entrelivros — redefinir senha",
    html: `
      <p>Olá!</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta no <strong>Entrelivros</strong>.</p>
      <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a></p>
      <p>Ou copie e cole este link no navegador:</p>
      <p>${resetUrl}</p>
      <p>Este link expira em 1 hora. Se você não pediu isso, pode ignorar este e-mail.</p>
    `,
    text: [
      "Olá!",
      "Recebemos um pedido para redefinir a senha da sua conta no Entrelivros.",
      `Acesse o link para criar uma nova senha: ${resetUrl}`,
      "Este link expira em 1 hora. Se você não pediu isso, pode ignorar este e-mail.",
    ].join("\n\n"),
  });
}

export async function sendTestEmail(to: string): Promise<{ id: string }> {
  if (!to.trim()) {
    throw new EmailConfigError("Destinatário de teste não informado");
  }

  return sendEmail({
    to: to.trim(),
    subject: "Entrelivros — teste de e-mail",
    html: `
      <p>Olá!</p>
      <p>Este é um e-mail de teste do <strong>Entrelivros</strong>.</p>
      <p>Se você recebeu, a integração com a Resend está funcionando.</p>
    `,
    text: "Olá! Este é um e-mail de teste do Entrelivros. Se você recebeu, a integração com a Resend está funcionando.",
  });
}
