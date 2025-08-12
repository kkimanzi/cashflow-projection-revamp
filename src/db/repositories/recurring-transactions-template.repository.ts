// db/repositories/recurring-transaction-template.repository.ts

import { recurringTransactionTemplate, transactionCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import type {
  CreateRecurringTransactionTemplateDto,
  RecurringTransactionTemplateWithCategoryDto,
  UpdateRecurringTransactionTemplateDto,
} from "../dto/recurring-transactions-template";

export class RecurringTransactionTemplateRepository {
  async getAll(
    organizationId: string,
  ): Promise<RecurringTransactionTemplateWithCategoryDto[]> {
    const templates = await db
      .select({
        id: recurringTransactionTemplate.id,
        organizationId: recurringTransactionTemplate.organizationId,
        categoryId: recurringTransactionTemplate.categoryId,
        amount: recurringTransactionTemplate.amount,
        description: recurringTransactionTemplate.description,
        frequency: recurringTransactionTemplate.frequency,
        interval: recurringTransactionTemplate.interval,
        startDate: recurringTransactionTemplate.startDate,
        endDate: recurringTransactionTemplate.endDate,
        weekDays: recurringTransactionTemplate.weekDays,
        monthDay: recurringTransactionTemplate.monthDay,
        customPattern: recurringTransactionTemplate.customPattern,
        isActive: recurringTransactionTemplate.isActive,
        isFixed: recurringTransactionTemplate.isFixed,
        createdAt: recurringTransactionTemplate.createdAt,
        updatedAt: recurringTransactionTemplate.updatedAt,
        category: {
          id: transactionCategory.id,
          name: transactionCategory.name,
          type: transactionCategory.type,
          displayPriority: transactionCategory.displayPriority,
        },
      })
      .from(recurringTransactionTemplate)
      .leftJoin(
        transactionCategory,
        eq(recurringTransactionTemplate.categoryId, transactionCategory.id),
      )
      .where(eq(recurringTransactionTemplate.organizationId, organizationId));

    return templates as RecurringTransactionTemplateWithCategoryDto[];
  }

  async getById(
    organizationId: string,
    id: string,
  ): Promise<RecurringTransactionTemplateWithCategoryDto | undefined> {
    const template = await db
      .select({
        id: recurringTransactionTemplate.id,
        organizationId: recurringTransactionTemplate.organizationId,
        categoryId: recurringTransactionTemplate.categoryId,
        amount: recurringTransactionTemplate.amount,
        description: recurringTransactionTemplate.description,
        frequency: recurringTransactionTemplate.frequency,
        interval: recurringTransactionTemplate.interval,
        startDate: recurringTransactionTemplate.startDate,
        endDate: recurringTransactionTemplate.endDate,
        weekDays: recurringTransactionTemplate.weekDays,
        monthDay: recurringTransactionTemplate.monthDay,
        customPattern: recurringTransactionTemplate.customPattern,
        isActive: recurringTransactionTemplate.isActive,
        createdAt: recurringTransactionTemplate.createdAt,
        updatedAt: recurringTransactionTemplate.updatedAt,
        category: {
          id: transactionCategory.id,
          name: transactionCategory.name,
          type: transactionCategory.type,
          displayPriority: transactionCategory.displayPriority,
        },
      })
      .from(recurringTransactionTemplate)
      .leftJoin(
        transactionCategory,
        eq(recurringTransactionTemplate.categoryId, transactionCategory.id),
      )
      .where(
        eq(recurringTransactionTemplate.id, id) &&
          eq(recurringTransactionTemplate.organizationId, organizationId),
      )
      .limit(1);

    if (!template[0]) {
      throw new Error("Recurring transaction template not found");
    }

    return template[0] as RecurringTransactionTemplateWithCategoryDto;
  }

  async create(
    organizationId: string,
    userId: string,
    data: CreateRecurringTransactionTemplateDto,
  ) {
    const [newTemplate] = await db
      .insert(recurringTransactionTemplate)
      .values({
        organizationId,
        createdByUserId: userId,
        ...data,
        startDate: data.startDate, // Ensure date is handled correctly
        endDate: data.endDate || null,
        weekDays: data.weekDays || null,
        monthDay: data.monthDay || null,
        customPattern: data.customPattern || null,
      })
      .returning();
    return newTemplate;
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateRecurringTransactionTemplateDto,
  ) {
    const [updatedTemplate] = await db
      .update(recurringTransactionTemplate)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(recurringTransactionTemplate.id, id),
          eq(recurringTransactionTemplate.organizationId, organizationId),
        ),
      )
      .returning();

    if (!updatedTemplate) {
      throw new Error("Recurring transaction template not found");
    }

    return updatedTemplate;
  }

  async delete(organizationId: string, id: string) {
    const result = await db
      .delete(recurringTransactionTemplate)
      .where(
        and(
          eq(recurringTransactionTemplate.id, id),
          eq(recurringTransactionTemplate.organizationId, organizationId),
        ),
      )
      .returning({ id: recurringTransactionTemplate.id });

    if (result.length === 0) {
      throw new Error("Recurring transaction template not found");
    }
  }
}
