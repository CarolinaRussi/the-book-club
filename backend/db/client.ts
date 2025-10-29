import { Client } from "pg";

export const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.on("error", (err) => {
  console.error("[db client error] Erro na conexão:", err);
});

client.connect();
