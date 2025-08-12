// db/dto/recurring-transaction-template/read.ts
import { recurringTransactionTemplate } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectRecurringTransactionTemplateSchema = createSelectSchema(
  recurringTransactionTemplate,
);

export const recurringTransactionTemplateWithCategorySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  categoryId: z.string(),
  amount: z.string(),
  description: z.string().nullable(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]),
  interval: z.number().int().min(1),
  startDate: z.string(),
  endDate: z.string().nullable(),
  weekDays: z.array(z.number().int().min(0).max(6)).nullable(), // 0 for Sunday, 6 for Saturday
  monthDay: z.number().int().min(1).max(31).nullable(),
  customPattern: z.record(z.any()).nullable(), // Assuming customPattern is a generic JSON object
  isFixed: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["MONEY_IN", "MONEY_OUT"]),
    displayPriority: z.number().nullable(),
  }),
});

export type RecurringTransactionTemplateDto = z.infer<
  typeof selectRecurringTransactionTemplateSchema
>;
export type RecurringTransactionTemplateWithCategoryDto = z.infer<
  typeof recurringTransactionTemplateWithCategorySchema
>;
