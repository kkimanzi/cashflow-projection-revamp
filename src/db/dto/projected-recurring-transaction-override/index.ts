import { projectedRecurringTransactionOverride } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectProjectedRecurringTransactionOverrideSchema =
  createSelectSchema(projectedRecurringTransactionOverride);

export const insertProjectedRecurringTransactionOverrideSchema =
  createInsertSchema(projectedRecurringTransactionOverride)
    .omit({
      id: true,
      organizationId: true,
      createdAt: true,
    })
    .extend({
      recurringTemplateId: z.string().min(1, "Template ID is required"),
      date: z
        .string()
        .min(1, "Date is required")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
    });

export type CreateProjectedRecurringTransactionOverrideDto = z.infer<
  typeof insertProjectedRecurringTransactionOverrideSchema
>;

export type ProjectedRecurringTransactionOverrideDto = z.infer<
  typeof selectProjectedRecurringTransactionOverrideSchema
>;
