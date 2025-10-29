import { Pool } from "pg";

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

export const pool = new Pool(connectionConfig);

pool.on("error", (err, client) => {
  console.error("[db pool error] Erro inesperado no cliente do pool:", err);
});
