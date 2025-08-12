import { reconciliation } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectReconciliationSchema = createSelectSchema(reconciliation);

export const reconciliationQuerySchema = z.object({
  organizationId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10),
});

export type ReconciliationDto = z.infer<typeof selectReconciliationSchema>;
export type ReconciliationQueryDto = z.infer<typeof reconciliationQuerySchema>;
