import { Resend } from "resend";
import {
  EmailConfigError,
  getEmailFrom,
  getFrontendUrl,
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<a href="${safeHref}" style="display:inline-block;background-color:#be2c3f;color:#fafafa;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px;margin:8px 0;">${safeLabel}</a>`;
}

function wrapTransactionalHtml(innerHtml: string): string {
  const logoUrl = escapeHtml(`${getFrontendUrl()}/logo-entrelivros-email.png`);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background-color:#f8f6f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f6f4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#faf8f6;border:1px solid #e3dbcf;border-radius:12px;">
          <tr>
            <td align="center" style="padding:28px 32px 16px;border-bottom:1px solid #e3dbcf;text-align:center;">
              <table role="presentation" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="200" style="width:200px;">
                    <img src="${logoUrl}" alt="Entrelivros" width="200" height="200" style="display:block;border:0;width:200px;height:200px;max-width:200px;" />
                  </td>
                </tr>
              </table>
              <p style="margin:4px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#3a2d23;text-align:center;">Entrelivros</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#3a2d23;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;color:#6e5c51;">
              Clube de leitura · <a href="${escapeHtml(getFrontendUrl())}" style="color:#be2c3f;">entrelivros.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<{ id: string }> {
  return sendEmail({
    to: to.trim(),
    subject: "Entrelivros — redefinir senha",
    html: wrapTransactionalHtml(`
      <p style="margin:0 0 16px;">Olá!</p>
      <p style="margin:0 0 16px;">Recebemos um pedido para redefinir a senha da sua conta no <strong>Entrelivros</strong>.</p>
      <p style="margin:0 0 16px;">${emailButton(resetUrl, "Criar nova senha")}</p>
      <p style="margin:0 0 8px;color:#6e5c51;font-size:14px;">Ou copie e cole este link no navegador:</p>
      <p style="margin:0 0 16px;font-size:14px;word-break:break-all;color:#6e5c51;">${escapeHtml(resetUrl)}</p>
      <p style="margin:0;color:#6e5c51;font-size:14px;">Este link expira em 1 hora. Se você não pediu isso, pode ignorar este e-mail.</p>
    `),
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
    html: wrapTransactionalHtml(`
      <p style="margin:0 0 16px;">Olá!</p>
      <p style="margin:0 0 16px;">Este é um e-mail de teste do <strong>Entrelivros</strong>.</p>
      <p style="margin:0;">Se você recebeu, a integração com a Resend está funcionando.</p>
    `),
    text: "Olá! Este é um e-mail de teste do Entrelivros. Se você recebeu, a integração com a Resend está funcionando.",
  });
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
    html: wrapTransactionalHtml(`
      <p style="margin:0 0 16px;">Olá!</p>
      <p style="margin:0 0 16px;"><strong>${escapeHtml(input.requesterName)}</strong> pediu para entrar no clube <strong>${escapeHtml(input.clubName)}</strong>.</p>
      <p style="margin:0;">${emailButton(input.manageUrl, "Abrir Gerenciar clube")}</p>
    `),
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
    html: wrapTransactionalHtml(`
      <p style="margin:0 0 16px;">Olá!</p>
      <p style="margin:0 0 16px;">Seu pedido para entrar no clube <strong>${escapeHtml(input.clubName)}</strong> foi aprovado.</p>
      <p style="margin:0;">${emailButton(input.clubHomeUrl, "Abrir o Entrelivros")}</p>
    `),
    text: [
      "Olá!",
      `Seu pedido para entrar no clube ${input.clubName} foi aprovado.`,
      `Acesse: ${input.clubHomeUrl}`,
    ].join("\n\n"),
  });
}

export type ReviewReminderEmailClub = {
  clubName: string;
  books: Array<{ title: string; url: string }>;
};

export async function sendReviewReminderEmail(input: {
  to: string;
  clubs: ReviewReminderEmailClub[];
}): Promise<{ id: string }> {
  const clubHtml = input.clubs
    .map((clubSection) => {
      const booksHtml = clubSection.books
        .map(
          (bookItem) =>
            `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #e3dbcf;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3a2d23;">
                ${escapeHtml(bookItem.title)}
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #e3dbcf;text-align:right;white-space:nowrap;">
                <a href="${escapeHtml(bookItem.url)}" style="color:#be2c3f;font-weight:700;text-decoration:none;">Dar nota</a>
              </td>
            </tr>`,
        )
        .join("");
      return `<p style="margin:20px 0 8px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#6e5c51;">${escapeHtml(clubSection.clubName)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${booksHtml}</table>`;
    })
    .join("");

  const textLines = [
    "Olá!",
    "Alguns livros que o clube já terminou ainda estão sem a sua nota.",
    "",
  ];
  for (const clubSection of input.clubs) {
    textLines.push(clubSection.clubName);
    for (const bookItem of clubSection.books) {
      textLines.push(`- ${bookItem.title}: ${bookItem.url}`);
    }
    textLines.push("");
  }
  textLines.push("Abra o livro no Entrelivros para dar a nota.");

  return sendEmail({
    to: input.to.trim(),
    subject: "Entrelivros — falta sua nota em livros do clube",
    html: wrapTransactionalHtml(`
      <p style="margin:0 0 16px;">Olá!</p>
      <p style="margin:0 0 8px;">Alguns livros que o clube já terminou ainda estão sem a sua nota.</p>
      ${clubHtml}
      <p style="margin:20px 0 0;color:#6e5c51;font-size:14px;">Abra o livro no Entrelivros para dar a nota.</p>
    `),
    text: textLines.join("\n"),
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
    html: wrapTransactionalHtml(`
      <p style="margin:0 0 8px;"><strong>Tipo:</strong> ${safeType}</p>
      <p style="margin:0 0 8px;"><strong>Usuária:</strong> ${safeName} (${safeEmail})</p>
      <p style="margin:0 0 8px;"><strong>userId:</strong> ${safeUserId}</p>
      <p style="margin:0 0 16px;"><strong>Página:</strong> ${safePageUrl}</p>
      <p style="margin:0 0 8px;"><strong>Mensagem:</strong></p>
      <p style="margin:0;">${safeMessage.replace(/\n/g, "<br />")}</p>
    `),
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
