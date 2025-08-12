import { createId } from "@paralleldrive/cuid2";
import { text } from "drizzle-orm/pg-core";

export const idColumn = text()
  .primaryKey()
  .$default(() => createId());
