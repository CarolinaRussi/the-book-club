export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new EmailConfigError(
      "EMAIL_FROM não definido (ex.: Entrelivros <onboarding@resend.dev>)",
    );
  }
  return from;
}

export function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new EmailConfigError("RESEND_API_KEY não definido");
  }
  return apiKey;
}

export function getFrontendUrl(): string {
  const url = process.env.FRONTEND_URL?.trim();
  if (!url) {
    throw new EmailConfigError(
      "FRONTEND_URL não definido (ex.: http://localhost:5173)",
    );
  }
  return url.replace(/\/$/, "");
}
