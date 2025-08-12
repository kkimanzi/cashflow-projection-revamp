import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { idColumn } from "../utils/id";
import { timestampWithTimezone } from "../utils/timestamps";

const timestamps = {
  createdAt: timestampWithTimezone("created_at", "date").notNull().defaultNow(),
  updatedAt: timestampWithTimezone("updated_at", "date").$onUpdate(
    () => new Date(),
  ),
  deletedAt: timestampWithTimezone("deleted_at", "date"),
};

export const user = pgTable("user", {
  id: idColumn,
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerified: boolean("email_verified"),
  image: text("image"),
  ...timestamps,
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified"),
  role: text("role").default("user"),
  isPayingCustomer: boolean("is_paying_customer").default(false),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: idColumn,
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
  impersonatedBy: text("impersonated_by"),
  ...timestamps,
});

export const account = pgTable("account", {
  id: idColumn,
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});

export const verification = pgTable("verification", {
  id: idColumn,
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});

export const organization = pgTable("organization", {
  id: idColumn,
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  ...timestamps,
});

export const member = pgTable("member", {
  id: idColumn,
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  scopes: text("scopes").notNull().default(""),
  ...timestamps,
});

export const invitation = pgTable("invitation", {
  id: idColumn,
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});
