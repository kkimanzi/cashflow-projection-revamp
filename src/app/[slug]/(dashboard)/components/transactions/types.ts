import type { ProjectionSettingsDto } from "@/db/dto/projection-settings";
import type {
  ReconciliationWithBalanceDto,
  TransactionWithCategoryDto,
} from "@/db/dto/transaction";

export interface LedgerData {
  reconciliation: ReconciliationWithBalanceDto | null;
  transactions: TransactionWithCategoryDto[];
  projectionSettings: ProjectionSettingsDto | null;
}

export interface LedgerRow {
  id: string;
  date: string;
  type: "reconciliation" | "transaction";
  description: string;
  moneyIn: number;
  moneyOut: number;
  runningBalance: number;
  category?: {
    name: string;
    type: "MONEY_IN" | "MONEY_OUT";
    displayPriority: number | null;
  };
  isProjection?: boolean;
  isReconciled?: boolean;
  isOverride?: boolean;
  isFixed?: boolean;
  overrideId?: string;
  recurringTemplateId?: string | null;
}
