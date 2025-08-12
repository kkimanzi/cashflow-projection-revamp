// db/schema/roles.ts (New file for roles, or add to a utility file)
import { pgRole } from "drizzle-orm/pg-core";

export const guestRole = pgRole("guest").existing();
export const authenticatedRole = pgRole("authenticated").existing();
export const adminRole = pgRole("admin").existing(); // Example: if you have an admin role
