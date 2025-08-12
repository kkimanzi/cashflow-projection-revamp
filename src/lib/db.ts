// db/db.ts
import * as authSchema from "@/db/schema/auth-schema";
import * as financialSchema from "@/db/schema/financial-schema";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "./envConfig.ts";

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("Missing Env Variable");
}
const sql = neon(process.env.DATABASE_URL);

// Combine all schemas
export const db = drizzle(sql, {
  schema: { ...authSchema, ...financialSchema },
});
