import { transactionCategory } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectTransactionCategorySchema =
  createSelectSchema(transactionCategory);

// Removed transactionCategoryWithPrecedenceSchema as displayPriority is now directly on transactionCategory.

export const transactionCategoryQuerySchema = z.object({
  organizationId: z.string(),
  type: z.enum(["MONEY_IN", "MONEY_OUT"]).optional(),
  includeSystem: z.boolean().default(true),
});

export type TransactionCategoryDto = z.infer<
  typeof selectTransactionCategorySchema
>;
// Removed TransactionCategoryWithPrecedenceDto
export type TransactionCategoryQueryDto = z.infer<
  typeof transactionCategoryQuerySchema
>;

// Removed selectTransactionCategoryPrecedenceSchema and TransactionCategoryPrecedenceDto
