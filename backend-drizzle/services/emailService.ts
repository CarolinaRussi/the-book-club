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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type FeedbackNotificationInput = {
  to: string;
  typeLabel: string;
  userName: string;
  userEmail: string;
  userId: string;
  message: string;
  pageUrl: string;
};

export async function sendJoinRequestAdminEmail(input: {
  to: string;
  clubName: string;
  requesterName: string;
  manageUrl: string;
}): Promise<{ id: string }> {
  return sendEmail({
    to: input.to.trim(),
    subject: `Entrelivros — novo pedido de entrada em ${input.clubName}`,
    html: `
      <p>Olá!</p>
      <p><strong>${escapeHtml(input.requesterName)}</strong> pediu para entrar no clube <strong>${escapeHtml(input.clubName)}</strong>.</p>
      <p><a href="${escapeHtml(input.manageUrl)}">Abrir Gerenciar clube</a> para aprovar ou recusar.</p>
    `,
    text: [
      "Olá!",
      `${input.requesterName} pediu para entrar no clube ${input.clubName}.`,
      `Abra Gerenciar clube: ${input.manageUrl}`,
    ].join("\n\n"),
  });
}

export async function sendJoinApprovedEmail(input: {
  to: string;
  clubName: string;
  clubHomeUrl: string;
}): Promise<{ id: string }> {
  return sendEmail({
    to: input.to.trim(),
    subject: `Entrelivros — você entrou em ${input.clubName}`,
    html: `
      <p>Olá!</p>
      <p>Seu pedido para entrar no clube <strong>${escapeHtml(input.clubName)}</strong> foi aprovado.</p>
      <p><a href="${escapeHtml(input.clubHomeUrl)}">Abrir o Entrelivros</a></p>
    `,
    text: [
      "Olá!",
      `Seu pedido para entrar no clube ${input.clubName} foi aprovado.`,
      `Acesse: ${input.clubHomeUrl}`,
    ].join("\n\n"),
  });
}

export async function sendFeedbackNotificationEmail(
  input: FeedbackNotificationInput,
): Promise<{ id: string }> {
  const subject = `[Entrelivros Feedback] ${input.typeLabel} — ${input.userName}`;
  const safeMessage = escapeHtml(input.message);
  const safePageUrl = escapeHtml(input.pageUrl);
  const safeName = escapeHtml(input.userName);
  const safeEmail = escapeHtml(input.userEmail);
  const safeUserId = escapeHtml(input.userId);
  const safeType = escapeHtml(input.typeLabel);

  return sendEmail({
    to: input.to.trim(),
    subject,
    html: `
      <p><strong>Tipo:</strong> ${safeType}</p>
      <p><strong>Usuária:</strong> ${safeName} (${safeEmail})</p>
      <p><strong>userId:</strong> ${safeUserId}</p>
      <p><strong>Página:</strong> ${safePageUrl}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${safeMessage.replace(/\n/g, "<br />")}</p>
    `,
    text: [
      `Tipo: ${input.typeLabel}`,
      `Usuária: ${input.userName} (${input.userEmail})`,
      `userId: ${input.userId}`,
      `Página: ${input.pageUrl}`,
      "",
      "Mensagem:",
      input.message,
    ].join("\n"),
  });
}
