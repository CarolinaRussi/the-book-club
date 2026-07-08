import "dotenv/config";
import { EmailConfigError } from "../utils/emailConfig";
import { EmailSendError, sendTestEmail } from "../services/emailService";

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const to = cliArgs[0]?.trim() ?? process.env.EMAIL_TO?.trim();

if (!to) {
  console.error(
    "Informe o destinatário: pnpm run email:test -- seu@email.com",
  );
  console.error("Ou defina EMAIL_TO no .env");
  process.exit(1);
}

sendTestEmail(to)
  .then((result) => {
    console.log(`E-mail de teste enviado para ${to} (id: ${result.id})`);
    setTimeout(() => process.exit(0), 100);
  })
  .catch((error: unknown) => {
    if (error instanceof EmailConfigError || error instanceof EmailSendError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
