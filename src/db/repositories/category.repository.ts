// src/db/repositories/category.repository.ts
import {
  type CreateTransactionCategoryDto,
  type UpdateTransactionCategoryDto,
  selectTransactionCategorySchema,
} from "@/db/dto/transaction-category";
import { transactionCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import z from "zod";

export class CategoryRepository {
  /**
   * Retrieves all transaction categories for a given organization,
   * with optional filtering by type and system status, ordered by display priority.
   * @param organizationId The ID of the organization.
   * @param type Optional: Filter by transaction type ("MONEY_IN" or "MONEY_OUT").
   * @param includeSystem Optional: Whether to include system-defined categories (default: true).
   * @returns A promise that resolves to an array of transaction categories.
   */
  async getAll(
    organizationId: string,
    type?: "MONEY_IN" | "MONEY_OUT",
    includeSystem = true,
  ) {
    const conditions = [eq(transactionCategory.organizationId, organizationId)];

    if (type) {
      conditions.push(eq(transactionCategory.type, type));
    }

    if (!includeSystem) {
      conditions.push(eq(transactionCategory.isSystem, false));
    }

    const categories = await db
      .select()
      .from(transactionCategory)
      .where(and(...conditions))
      .orderBy(transactionCategory.displayPriority); // Order by displayPriority ascending (lower number, higher precedence)

    return z.array(selectTransactionCategorySchema).parse(categories);
  }

  /**
   * Creates a new transaction category.
   * @param organizationId The ID of the organization.
   * @param data The data for the new category.
   * @returns A promise that resolves to the created transaction category.
   */
  async create(
    organizationId: string,
    userId: string,
    data: CreateTransactionCategoryDto,
  ) {
    const [newCategory] = await db
      .insert(transactionCategory)
      .values({
        ...data,
        organizationId,
        createdByUserId: userId,
        // displayPriority is not set on creation as per requirements
      })
      .returning();

    if (!newCategory) {
      throw new Error("Failed to create category");
    }
    return selectTransactionCategorySchema.parse(newCategory);
  }

  /**
   * Updates an existing transaction category.
   * @param id The ID of the category to update.
   * @param organizationId The ID of the organization.
   * @param data The data to update the category with.
   * @returns A promise that resolves to the updated transaction category.
   */
  async update(
    id: string,
    organizationId: string,
    data: UpdateTransactionCategoryDto,
  ) {
    const [updatedCategory] = await db
      .update(transactionCategory)
      .set(data)
      .where(
        and(
          eq(transactionCategory.id, id),
          eq(transactionCategory.organizationId, organizationId),
        ),
      )
      .returning();

    if (!updatedCategory) {
      throw new Error("Category not found");
    }
    return selectTransactionCategorySchema.parse(updatedCategory);
  }

  /**
   * Updates the display priority for multiple transaction categories in a single transaction.
   * @param organizationId The ID of the organization.
   * @param updates An array of objects, each containing a categoryId and its new displayPriority.
   * @returns A promise that resolves when the updates are complete.
   */
  async updateManyPrecedence(
    organizationId: string,
    updates: Array<{ categoryId: string; displayPriority: number | null }>,
  ) {
    if (updates.length === 0) {
      return { success: true };
    }

    try {
      for (const update of updates) {
        await db
          .update(transactionCategory)
          .set({ displayPriority: update.displayPriority })
          .where(
            and(
              eq(transactionCategory.id, update.categoryId),
              eq(transactionCategory.organizationId, organizationId),
            ),
          );
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating category precedence:", error);
      return { success: false, error: "Failed to update category precedence" };
    }
  }

  /**
   * Deletes a transaction category.
   * @param id The ID of the category to delete.
   * @param organizationId The ID of the organization.
   * @returns A promise that resolves to a success indicator.
   */
  async delete(id: string, organizationId: string) {
    const [deletedCategory] = await db
      .delete(transactionCategory)
      .where(
        and(
          eq(transactionCategory.id, id),
          eq(transactionCategory.organizationId, organizationId),
          eq(transactionCategory.isSystem, false), // Prevent deletion of system categories
        ),
      )
      .returning();

    if (!deletedCategory) {
      throw new Error("Category not found or cannot be deleted");
    }
    return { success: true };
  }
}
