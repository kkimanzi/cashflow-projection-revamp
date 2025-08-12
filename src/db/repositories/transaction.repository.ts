// db/repositories/transaction.repository.ts
import type {
  CreateReconciliationDto,
  CreateTransactionDto,
  LedgerQueryDto,
  ProjectionSettingsDto,
  ReconciliationWithBalanceDto,
  TransactionWithCategoryDto,
  UpdateTransactionDto,
} from "@/db/dto/transaction";
import { reconciliation, transaction, transactionCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";

export class TransactionRepository {
  async create(
    organizationId: string,
    userId: string,
    data: CreateTransactionDto,
  ): Promise<TransactionWithCategoryDto> {
    const [newTransaction] = await db
      .insert(transaction)
      .values({
        organizationId,
        createdByUserId: userId,
        categoryId: data.categoryId,
        date: data.date,
        amount: data.amount,
        description: data.description,
        type: data.type,
      })
      .returning();

    return this.getById(organizationId, newTransaction.id);
  }

  async getById(
    organizationId: string,
    id: string,
  ): Promise<TransactionWithCategoryDto> {
    const result = await db
      .select({
        id: transaction.id,
        organizationId: transaction.organizationId,
        categoryId: transaction.categoryId,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        isRecurringInstance: transaction.isRecurringInstance,
        recurringTemplateId: transaction.recurringTemplateId,
        isReconciled: transaction.isReconciled,
        reconciliationId: transaction.reconciliationId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        category: {
          id: transactionCategory.id,
          name: transactionCategory.name,
          type: transactionCategory.type,
          displayPriority: transactionCategory.displayPriority,
        },
      })
      .from(transaction)
      .innerJoin(
        transactionCategory,
        eq(transaction.categoryId, transactionCategory.id),
      )
      .where(
        and(
          eq(transaction.organizationId, organizationId),
          eq(transaction.id, id),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new Error("Transaction not found");
    }

    return result[0];
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateTransactionDto,
  ): Promise<TransactionWithCategoryDto> {
    const updateData: Partial<typeof transaction.$inferInsert> = {};

    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.date) updateData.date = data.date;
    if (data.amount) updateData.amount = data.amount;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.type) updateData.type = data.type;

    await db
      .update(transaction)
      .set(updateData)
      .where(
        and(
          eq(transaction.organizationId, organizationId),
          eq(transaction.id, id),
        ),
      );

    return this.getById(organizationId, id);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await db
      .delete(transaction)
      .where(
        and(
          eq(transaction.organizationId, organizationId),
          eq(transaction.id, id),
        ),
      );
  }

  async getLedgerData(
    params: LedgerQueryDto & {
      organizationId: string;
      scopes?: string;
      userId: string;
    },
  ): Promise<{
    reconciliation: ReconciliationWithBalanceDto | null;
    transactions: TransactionWithCategoryDto[];
    projectionSettings: ProjectionSettingsDto | null;
  }> {
    // Redacted
    return {
      reconciliation: null,
      transactions: [],
      projectionSettings: null,
    };
  }

  async createReconciliation(
    organizationId: string,
    userId: string,
    data: CreateReconciliationDto,
  ): Promise<ReconciliationWithBalanceDto> {
    const [newReconciliation] = await db
      .insert(reconciliation)
      .values({
        organizationId,
        createdByUserId: userId,
        date: data.date,
        balance: data.balance,
        notes: data.notes,
      })
      .returning();

    return newReconciliation;
  }

  async getAllReconciliations(
    organizationId: string,
    limit = 10,
  ): Promise<ReconciliationWithBalanceDto[]> {
    const reconciliations = await db
      .select()
      .from(reconciliation)
      .where(eq(reconciliation.organizationId, organizationId))
      .orderBy(desc(reconciliation.date), desc(reconciliation.createdAt))
      .limit(limit);

    return reconciliations;
  }
}
