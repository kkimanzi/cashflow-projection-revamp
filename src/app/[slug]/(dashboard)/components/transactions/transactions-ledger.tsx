// app/(app)/dashboard/transaction-ledger.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ConfirmationDialog,
  useConfirmation,
} from "@/components/ui/use-confirmation";
import type { TransactionWithCategoryDto } from "@/db/dto/transaction";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScopeCheck } from "@/hooks/use-scope-check";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteOverrideDialog } from "../projectionOverrides/delete-override-dialog";
import { EditProjectionOverrideDialog } from "../projectionOverrides/edit-override-dialog";
import TransactionDialog from "./add-transaction-dialog";
import { TransactionActions } from "./row-actions";
import type { LedgerData, LedgerRow } from "./types";

export default function TransactionLedger({ orgSlug }: { orgSlug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithCategoryDto | null>(null);
  const [editOverrideDialogOpen, setEditOverrideDialogOpen] = useState(false);
  const [deleteOverrideDialogOpen, setDeleteOverrideDialogOpen] =
    useState(false);
  const [selectedOverride, setSelectedOverride] = useState<{
    id?: string;
    amount: string;
    description?: string;
    recurringTemplateId: string;
    date: string;
  } | null>(null);

  const { confirm, dialogProps } = useConfirmation();
  const isMobile = useIsMobile();

  const { checkScope } = useScopeCheck();
  const hasProjectionRead = checkScope("projection:read");

  const {
    data: ledgerData,
    isError,
    isLoading: loading,
    refetch,
  } = useQuery<LedgerData>({
    queryKey: ["ledgerData", orgSlug],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
      if (!response.ok) {
        throw new Error("Failed to fetch ledger data");
      }
      return response.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const processLedgerRows = useMemo(() => {
    return (data: LedgerData): LedgerRow[] => {
      const rows: LedgerRow[] = [];
      let runningBalance = Number.parseFloat(
        data.reconciliation?.balance || "0",
      );

      if (data.reconciliation) {
        rows.push({
          id: data.reconciliation.id,
          date: data.reconciliation.date,
          type: "reconciliation",
          description: `Reconciliation${data.reconciliation.notes ? ` - ${data.reconciliation.notes}` : ""}`,
          moneyIn: 0,
          moneyOut: 0,
          runningBalance,
          isProjection: false,
        });
      }

      data.transactions.forEach((transaction) => {
        const amount = Number.parseFloat(transaction.amount);
        const moneyIn = transaction.type === "MONEY_IN" ? amount : 0;
        const moneyOut = transaction.type === "MONEY_OUT" ? amount : 0;

        runningBalance += moneyIn - moneyOut;

        rows.push({
          id: transaction.id,
          date: transaction.date,
          type: "transaction",
          description: transaction.description || transaction.category.name,
          moneyIn,
          moneyOut,
          runningBalance,
          category: transaction.category,
          isProjection: transaction.isProjection,
          isReconciled: transaction.isReconciled,
          recurringTemplateId: transaction.recurringTemplateId,
          isOverride: transaction.isOverride,
          overrideId: transaction.overrideId,
          isFixed: transaction.isFixed,
        });
      });

      return rows;
    };
  }, []);

  const handleEditTransaction = (row: LedgerRow) => {
    if (row.type !== "transaction" || row.isProjection) return;

    const transaction = ledgerData?.transactions.find((t) => t.id === row.id);
    if (!transaction) return;

    setSelectedTransaction(transaction);
    setTransactionDialogOpen(true);
  };

  const handleDeleteClick = (transactionId: string) => {
    confirm({
      title: "Delete Transaction",
      description:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/transactions/${transactionId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete transaction");
          }

          toast.success("Transaction deleted successfully");
          refetch();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to delete transaction",
          );
        }
      },
    });
  };

  const handleEditProjection = (row: LedgerRow) => {
    if (!row.recurringTemplateId) {
      console.error("Missing recurringTemplateId for projection");
      return;
    }

    setSelectedOverride({
      id: row.overrideId,
      amount:
        row.moneyIn > 0 ? row.moneyIn.toString() : row.moneyOut.toString(),
      description: row.description,
      recurringTemplateId: row.recurringTemplateId,
      date: row.date,
    });
    setEditOverrideDialogOpen(true);
  };

  const handleResetProjection = (row: LedgerRow) => {
    if (!row.overrideId) return;
    setSelectedOverride({
      id: row.overrideId,
      amount: "0",
      date: "",
      recurringTemplateId: "",
    });
    setDeleteOverrideDialogOpen(true);
  };

  const handleOverrideSuccess = () => {
    refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM dd, yyyy");
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Error loading ledger data: {error}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ledgerData) {
    return null;
  }

  const ledgerRows = processLedgerRows(ledgerData);
  const currentProjectionDays =
    ledgerData.projectionSettings?.defaultDaysToProject || 30;

  return (
    <div>
      {/* Ledger Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Cash Flow Ledger
            {ledgerData.reconciliation && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                Last reconciled: {formatDate(ledgerData.reconciliation.date)}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs sm:text-sm">
              Projecting {currentProjectionDays} days
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 sm:px-4 font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium">
                    Description
                  </th>
                  <th className="text-right py-3 px-2 sm:px-4 font-medium text-green-600">
                    {isMobile ? "In" : "Money In"}
                  </th>
                  <th className="text-right py-3 px-2 sm:px-4 font-medium text-red-600">
                    {isMobile ? "Out" : "Money Out"}
                  </th>
                  {hasProjectionRead && (
                    <th className="text-right py-3 px-2 sm:px-4 font-medium">
                      Balance
                    </th>
                  )}
                  <th className="text-center py-3 px-2 sm:px-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b hover:bg-gray-50 ${
                      row.type === "reconciliation" ? "bg-blue-50" : ""
                    } ${
                      row.isProjection
                        ? row.isOverride
                          ? "bg-yellow-50"
                          : "bg-gray-50 text-gray-500 italic"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDate(row.date)}
                        </span>
                        {row.category && (
                          <Badge
                            variant="secondary"
                            className="w-fit mt-1 text-xs"
                          >
                            {row.category.name}
                          </Badge>
                        )}
                        {row.isProjection && (
                          <Badge
                            variant="outline"
                            className={`w-fit mt-1 text-xs ${
                              row.isOverride
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {`Projection ${row.isFixed ? "- Fixed" : ""}${row.isOverride ? " - Modified" : ""}`}
                          </Badge>
                        )}
                        {!row.isProjection &&
                          row.isReconciled &&
                          row.type === "transaction" && (
                            <Badge
                              variant="outline"
                              className="w-fit mt-1 text-xs bg-green-100 text-green-700"
                            >
                              Reconciled
                            </Badge>
                          )}
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-2">
                        {row.type === "reconciliation" && (
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            Recon
                          </Badge>
                        )}
                        <span className="text-sm sm:text-base">
                          {row.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right">
                      {row.moneyIn > 0 && (
                        <div className="flex items-center justify-end gap-1">
                          {!isMobile && (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-green-600 font-medium text-sm sm:text-base">
                            {formatCurrency(row.moneyIn)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right">
                      {row.moneyOut > 0 && (
                        <div className="flex items-center justify-end gap-1">
                          {!isMobile && (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-red-600 font-medium text-sm sm:text-base">
                            {formatCurrency(row.moneyOut)}
                          </span>
                        </div>
                      )}
                    </td>
                    {hasProjectionRead && (
                      <td
                        className={`py-3 px-2 sm:px-4 text-right font-medium text-sm sm:text-base ${getBalanceColor(
                          row.runningBalance,
                        )}`}
                      >
                        {formatCurrency(row.runningBalance)}
                      </td>
                    )}
                    <td className="py-3 px-2 sm:px-4">
                      <TransactionActions
                        row={row}
                        onEditTransaction={handleEditTransaction}
                        onDeleteTransaction={handleDeleteClick}
                        onEditProjection={handleEditProjection}
                        onResetProjection={handleResetProjection}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ledgerRows.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <ConfirmationDialog {...dialogProps} />
      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        transaction={selectedTransaction}
      />
      {editOverrideDialogOpen && selectedOverride && (
        <EditProjectionOverrideDialog
          open={editOverrideDialogOpen}
          onOpenChange={setEditOverrideDialogOpen}
          overrideId={selectedOverride.id}
          initialValues={{
            amount: selectedOverride.amount,
            description: selectedOverride.description || "",
            recurringTemplateId: selectedOverride.recurringTemplateId,
            date: selectedOverride.date,
          }}
          onSuccess={handleOverrideSuccess}
        />
      )}
      {deleteOverrideDialogOpen && (
        <DeleteOverrideDialog
          open={deleteOverrideDialogOpen}
          onOpenChange={setDeleteOverrideDialogOpen}
          overrideId={selectedOverride?.id || ""}
          onSuccess={handleOverrideSuccess}
        />
      )}
    </div>
  );
}
