// db/dto/transaction/read.ts
import { transaction } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
// Import the actual projection settings DTO from its source
import type { selectProjectionSettingsSchema } from "../projection-settings"; // <--- Ensure this path is correct

export const selectTransactionSchema = createSelectSchema(transaction);

export const transactionWithCategorySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  categoryId: z.string(),
  date: z.string(), // Matches DB schema (string)
  amount: z.string(),
  description: z.string().nullable(),
  type: z.enum(["MONEY_IN", "MONEY_OUT"]),
  isRecurringInstance: z.boolean(),
  recurringTemplateId: z.string().nullable(),
  isReconciled: z.boolean(),
  reconciliationId: z.string().nullable(),
  createdAt: z.string(), // Changed from Date to string
  updatedAt: z.string().nullable(), // Changed from Date to string
  category: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["MONEY_IN", "MONEY_OUT"]),
    displayPriority: z.number().nullable(),
  }),
  isFixed: z.boolean().optional(),
  isSkipped: z.boolean().optional(),
  isProjection: z.boolean().optional(), // To mark projected transactions
  isOverride: z.boolean().optional(),
  overrideId: z.string().optional(),
});

export const reconciliationWithBalanceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  date: z.string(),
  balance: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(), // Changed from Date to string
  updatedAt: z.string().nullable(), // Changed from Date to string
});

export const ledgerQuerySchema = z.object({
  organizationId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  scopes: z.string().optional(),
  // projectionDays is no longer a query param, but derived from settings
  // projectionDays: z.number().int().min(1).max(365).default(30),
});

export type TransactionDto = z.infer<typeof selectTransactionSchema>;
export type TransactionWithCategoryDto = z.infer<
  typeof transactionWithCategorySchema
>;
export type LedgerQueryDto = z.infer<typeof ledgerQuerySchema>;
export type ReconciliationWithBalanceDto = z.infer<
  typeof reconciliationWithBalanceSchema
>;
export type ProjectionSettingsDto = z.infer<
  typeof selectProjectionSettingsSchema
>; // <--- Use your existing schema
