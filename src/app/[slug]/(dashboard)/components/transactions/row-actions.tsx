import { Button } from "@/components/ui/button";
import { useScopeCheck } from "@/hooks/use-scope-check";
import { Edit, RotateCcw, Trash2 } from "lucide-react";
import type { LedgerRow } from "./types";

interface TransactionActionsProps {
  row: LedgerRow;
  onEditTransaction: (row: LedgerRow) => void;
  onDeleteTransaction: (id: string) => void;
  onEditProjection: (row: LedgerRow) => void;
  onResetProjection: (row: LedgerRow) => void;
}

export const TransactionActions = ({
  row,
  onEditTransaction,
  onDeleteTransaction,
  onEditProjection,
  onResetProjection,
}: TransactionActionsProps) => {
  const { checkScope } = useScopeCheck();

  return (
    <div className="flex items-center justify-center gap-1">
      {row.type === "transaction" && !row.isProjection && (
        <>
          {checkScope("transaction:update") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTransaction(row)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {checkScope("transaction:delete") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTransaction(row.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
      {row.type === "transaction" && row.isProjection && (
        <>
          {checkScope("projection:update") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditProjection(row)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {row.isOverride && checkScope("projection:update") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResetProjection(row)}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
