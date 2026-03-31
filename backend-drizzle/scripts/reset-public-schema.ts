/**
 * Apaga todo o schema `public` (tabelas, enums, dados) e recria vazio.
 * Uso: npm run db:reset-schema -- --yes
 * Depois: npm run db:push
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url?.trim()) {
  console.error("DATABASE_URL não definida no .env");
  process.exit(1);
}

if (!process.argv.includes("--yes")) {
  console.error(
    "Isso DESTROI todos os dados do schema public.\n" +
      "Para confirmar, rode: npm run db:reset-schema -- --yes\n" +
      "Em seguida: npm run db:push",
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

async function main() {
  await client.connect();
  try {
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("GRANT ALL ON SCHEMA public TO public");
    await client.query("GRANT ALL ON SCHEMA public TO CURRENT_USER");
    console.log("Schema public zerado. Rode: npm run db:push");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
