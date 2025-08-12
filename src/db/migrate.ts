import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
// src/db/migrate.ts
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "./schema"; // Adjust path as needed
import "../lib/envConfig.ts";

async function main() {
  // This check will now rely on the environment (dotenv-cli locally, Vercel on deployment)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Ensure it is configured in .env.local (for local development) or in Vercel environment variables (for deployment).",
    );
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations finished!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
