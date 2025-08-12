import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { idColumn } from "../utils/id";
import { timestamps } from "../utils/timestamps";
import { organization, user } from "./auth-schema";

// ================== ENUMS ==================

export const transactionTypeEnum = pgEnum("transaction_type", [
  "MONEY_IN",
  "MONEY_OUT",
]);

export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
  "CUSTOM",
]);

// ================== TABLES ==================

// financialAccount table has been removed as per your request.
// Other tables now directly reference organization.id where they previously referenced financialAccount.id

export const transactionCategory = pgTable("transaction_category", {
  id: idColumn,
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: transactionTypeEnum("type").notNull(),
  isSystem: boolean("is_system").notNull().default(false),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  displayPriority: integer("display_priority"), // Optional precedence field
  ...timestamps,
});

export const recurringTransactionTemplate = pgTable(
  "recurring_transaction_template",
  {
    id: idColumn,
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }), // Now references organization.id
    // accountId removed, as financialAccount is removed
    categoryId: text("category_id")
      .notNull()
      .references(() => transactionCategory.id, { onDelete: "restrict" }),
    amount: decimal("amount", { precision: 19, scale: 2 }).notNull(),
    description: text("description"),
    frequency: recurrenceFrequencyEnum("frequency").notNull(),
    interval: integer("interval").notNull().default(1),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    weekDays: integer("week_days").array(),
    monthDay: integer("month_day"),
    customPattern: jsonb("custom_pattern"),
    isFixed: boolean("is_fixed").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
);

export const reconciliation = pgTable("reconciliation", {
  id: idColumn,
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }), // Now references organization.id
  // accountId removed, as financialAccount is removed
  date: date("date").notNull(),
  balance: decimal("balance", { precision: 19, scale: 2 }).notNull(),
  notes: text("notes"),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  ...timestamps,
});

export const transaction = pgTable("transaction", {
  id: idColumn,
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }), // Now references organization.id
  // accountId removed, as financialAccount is removed
  categoryId: text("category_id")
    .notNull()
    .references(() => transactionCategory.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  amount: decimal("amount", { precision: 19, scale: 2 }).notNull(),
  description: text("description"),
  type: transactionTypeEnum("type").notNull(),
  isRecurringInstance: boolean("is_recurring_instance")
    .notNull()
    .default(false),
  recurringTemplateId: text("recurring_template_id").references(
    () => recurringTransactionTemplate.id,
    { onDelete: "set null" },
  ),
  isReconciled: boolean("is_reconciled").notNull().default(false),
  reconciliationId: text("reconciliation_id").references(
    () => reconciliation.id,
    { onDelete: "set null" },
  ),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  ...timestamps,
});

export const projectionSettings = pgTable(
  "projection_settings",
  {
    id: idColumn,
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }), // Now references organization.id
    // accountId removed, as financialAccount is removed
    defaultDaysToProject: integer("default_days_to_project")
      .notNull()
      .default(30),
    includePendingTransactions: boolean("include_pending_transactions")
      .notNull()
      .default(true),
    includeRecurringTransactions: boolean("include_recurring_transactions")
      .notNull()
      .default(true),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => {
    return {
      orgAccountUnique: uniqueIndex(
        "org_account_unique_projection_settings",
      ).on(table.organizationId), // Unique index updated to only use organizationId
    };
  },
);

// Add to your schema file
export const projectedRecurringTransactionOverride = pgTable(
  "projected_recurring_transaction_override",
  {
    id: idColumn,
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    recurringTemplateId: text("recurring_template_id")
      .notNull()
      .references(() => recurringTransactionTemplate.id, {
        onDelete: "cascade",
      }),
    date: date("date").notNull(), // The projected date being overridden
    amount: decimal("amount", { precision: 19, scale: 2 }).notNull(),
    description: text("description"),
    skip: boolean("skip").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => {
    return {
      uniqueProjectionOverride: uniqueIndex("unique_projection_override").on(
        table.organizationId,
        table.recurringTemplateId,
        table.date,
      ),
    };
  },
);

// ================== RELATIONS ==================

// financialAccountRelations removed

export const transactionCategoryRelations = relations(
  transactionCategory,
  ({ one, many }) => ({
    transactions: many(transaction),
    recurringTemplates: many(recurringTransactionTemplate),
    createdBy: one(user, {
      fields: [transactionCategory.createdByUserId],
      references: [user.id],
    }),
    organization: one(organization, {
      fields: [transactionCategory.organizationId],
      references: [organization.id],
    }),
  }),
);

export const recurringTransactionTemplateRelations = relations(
  recurringTransactionTemplate,
  ({ one, many }) => ({
    // account relation removed, as financialAccount is removed
    organization: one(organization, {
      // New relation to organization
      fields: [recurringTransactionTemplate.organizationId],
      references: [organization.id],
    }),
    category: one(transactionCategory, {
      fields: [recurringTransactionTemplate.categoryId],
      references: [transactionCategory.id],
    }),
    transactions: many(transaction),
    createdBy: one(user, {
      fields: [recurringTransactionTemplate.createdByUserId],
      references: [user.id],
    }),
  }),
);

export const reconciliationRelations = relations(
  reconciliation,
  ({ one, many }) => ({
    // account relation removed, as financialAccount is removed
    organization: one(organization, {
      // New relation to organization
      fields: [reconciliation.organizationId],
      references: [organization.id],
    }),
    transactions: many(transaction),
    createdBy: one(user, {
      fields: [reconciliation.createdByUserId],
      references: [user.id],
    }),
  }),
);

export const transactionRelations = relations(transaction, ({ one }) => ({
  // account relation removed, as financialAccount is removed
  organization: one(organization, {
    // New relation to organization
    fields: [transaction.organizationId],
    references: [organization.id],
  }),
  category: one(transactionCategory, {
    fields: [transaction.categoryId],
    references: [transactionCategory.id],
  }),
  reconciliation: one(reconciliation, {
    fields: [transaction.reconciliationId],
    references: [reconciliation.id],
  }),
  recurringTemplate: one(recurringTransactionTemplate, {
    fields: [transaction.recurringTemplateId],
    references: [recurringTransactionTemplate.id],
  }),
  createdBy: one(user, {
    fields: [transaction.createdByUserId],
    references: [user.id],
  }),
}));

export const projectionSettingsRelations = relations(
  projectionSettings,
  ({ one }) => ({
    // account relation removed, as financialAccount is removed
    organization: one(organization, {
      // New relation to organization
      fields: [projectionSettings.organizationId],
      references: [organization.id],
    }),
    createdBy: one(user, {
      fields: [projectionSettings.createdByUserId],
      references: [user.id],
    }),
  }),
);

// Add to your relations
export const projectedRecurringTransactionOverrideRelations = relations(
  projectedRecurringTransactionOverride,
  ({ one }) => ({
    organization: one(organization, {
      fields: [projectedRecurringTransactionOverride.organizationId],
      references: [organization.id],
    }),
    recurringTemplate: one(recurringTransactionTemplate, {
      fields: [projectedRecurringTransactionOverride.recurringTemplateId],
      references: [recurringTransactionTemplate.id],
    }),
    createdBy: one(user, {
      fields: [projectedRecurringTransactionOverride.createdByUserId],
      references: [user.id],
    }),
  }),
);
