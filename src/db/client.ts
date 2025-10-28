import { Client } from "pg";

export const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_07cYqlGpgJdQ@ep-raspy-rice-ad5v10f5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

client.connect();
