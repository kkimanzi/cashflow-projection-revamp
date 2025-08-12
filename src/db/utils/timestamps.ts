import { type PgColumn, index, timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true,
  }).$onUpdate(() => new Date().toISOString()),
  deletedAt: timestamp("deleted_at", {
    mode: "string",
    withTimezone: true,
  }),
};

export const timestampIndices = <
  T extends { deletedAt: PgColumn; createdAt: PgColumn },
>(
  table: T,
) => [index().on(table.createdAt), index().on(table.deletedAt)];

export const timestampWithTimezone = (
  name: string,
  mode = "string" as "string" | "date",
) =>
  timestamp(name, {
    mode,
    withTimezone: true,
  });
