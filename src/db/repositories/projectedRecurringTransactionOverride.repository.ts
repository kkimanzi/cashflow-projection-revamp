// src/db/repositories/projected-recurring-transaction-override.repository.ts
import {
  type CreateProjectedRecurringTransactionOverrideDto,
  selectProjectedRecurringTransactionOverrideSchema,
} from "@/db/dto/projected-recurring-transaction-override";
import { projectedRecurringTransactionOverride } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export class ProjectedRecurringTransactionOverrideRepository {
  async getByOrganization(organizationId: string) {
    const overrides =
      await db.query.projectedRecurringTransactionOverride.findMany({
        where: eq(
          projectedRecurringTransactionOverride.organizationId,
          organizationId,
        ),
      });
    return overrides.map((override) =>
      selectProjectedRecurringTransactionOverrideSchema.parse(override),
    );
  }

  async create(
    organizationId: string,
    userId: string,
    data: CreateProjectedRecurringTransactionOverrideDto,
  ) {
    // Validate date format
    if (!data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error("Invalid date format");
    }

    const [override] = await db
      .insert(projectedRecurringTransactionOverride)
      .values({
        ...data,
        organizationId,
        createdByUserId: userId,
        recurringTemplateId: data.recurringTemplateId,
        date: data.date,
      })
      .returning();

    if (!override) {
      throw new Error("Failed to create projection override");
    }
    return selectProjectedRecurringTransactionOverrideSchema.parse(override);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<CreateProjectedRecurringTransactionOverrideDto>,
  ) {
    const [override] = await db
      .update(projectedRecurringTransactionOverride)
      .set(data)
      .where(
        and(
          eq(projectedRecurringTransactionOverride.id, id),
          eq(
            projectedRecurringTransactionOverride.organizationId,
            organizationId,
          ),
        ),
      )
      .returning();

    if (!override) {
      throw new Error("Projection override not found");
    }
    return selectProjectedRecurringTransactionOverrideSchema.parse(override);
  }

  async delete(id: string, organizationId: string) {
    await db
      .delete(projectedRecurringTransactionOverride)
      .where(
        and(
          eq(projectedRecurringTransactionOverride.id, id),
          eq(
            projectedRecurringTransactionOverride.organizationId,
            organizationId,
          ),
        ),
      );
  }
}
