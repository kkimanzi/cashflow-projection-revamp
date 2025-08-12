// src/db/repositories/projection-settings.repository.ts
import {
  type CreateProjectionSettingsDto,
  type UpdateProjectionSettingsDto,
  selectProjectionSettingsSchema,
} from "@/db/dto/projection-settings";
import { projectionSettings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export class ProjectionSettingsRepository {
  /**
   * Retrieves the projection settings for a given organization.
   * Since there's a unique index on organizationId, there should be at most one.
   * @param organizationId The ID of the organization.
   * @returns A promise that resolves to the ProjectionSettingsDto or null if not found.
   */
  async get(organizationId: string) {
    const settings = await db.query.projectionSettings.findFirst({
      where: eq(projectionSettings.organizationId, organizationId),
    });

    if (!settings) {
      return null;
    }
    return selectProjectionSettingsSchema.parse(settings);
  }

  /**
   * Creates or updates the projection settings for a given organization.
   * Uses `onConflictDoUpdate` to handle both insert and update scenarios.
   * @param organizationId The ID of the organization.
   * @param data The data for the projection settings.
   * @returns A promise that resolves to the created or updated ProjectionSettingsDto.
   */
  async upsert(
    organizationId: string,
    userId: string,
    data: CreateProjectionSettingsDto | UpdateProjectionSettingsDto,
  ) {
    const [upsertedSettings] = await db
      .insert(projectionSettings)
      .values({
        organizationId,
        createdByUserId: userId,
        defaultDaysToProject: data.defaultDaysToProject,
        includePendingTransactions: data.includePendingTransactions,
        includeRecurringTransactions: data.includeRecurringTransactions,
        // id and timestamps are handled by drizzle-orm and idColumn/timestamps utils
      })
      .onConflictDoUpdate({
        target: projectionSettings.organizationId, // Conflict on organizationId
        set: {
          defaultDaysToProject: data.defaultDaysToProject,
          includePendingTransactions: data.includePendingTransactions,
          includeRecurringTransactions: data.includeRecurringTransactions,
        },
      })
      .returning();

    if (!upsertedSettings) {
      throw new Error("Failed to create or update projection settings");
    }
    return selectProjectionSettingsSchema.parse(upsertedSettings);
  }
}
