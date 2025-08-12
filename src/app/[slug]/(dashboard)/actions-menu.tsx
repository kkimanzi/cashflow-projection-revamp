"use client";
import { Button } from "@/components/ui/button";
import type { TransactionWithCategoryDto } from "@/db/dto/transaction";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScopeCheck } from "@/hooks/use-scope-check";
import type { AppScope } from "@/lib/scopes/scopes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { CalendarClock, DollarSign, ListTree, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import AddReconciliationDialog from "./components/transactions/add-reconciliation-dialog";
import TransactionDialog from "./components/transactions/add-transaction-dialog";

interface ActionItem {
  name: string;
  mobileName: string;
  icon: React.ReactNode;
  onClick: () => void;
  requiredScope: AppScope;
}

export const ActionsMenu = () => {
  const router = useRouter();

  const pathname = usePathname();
  const isMobile = useIsMobile();

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithCategoryDto | null>(null);
  const [showReconciliationDialog, setShowReconciliationDialog] =
    useState(false);

  const { checkScope } = useScopeCheck();
  const actionItems: ActionItem[] = [
    {
      name: "Transaction Categories",
      mobileName: "Categories",
      icon: <ListTree className="h-4 w-4" />,
      onClick: () => router.push(`${pathname}/transaction-categories`),
      requiredScope: "transaction_category:read",
    },
    {
      name: "Recurring Transactions",
      mobileName: "Recurring",
      icon: <CalendarClock className="h-4 w-4" />,
      onClick: () => router.push(`${pathname}/recurring-transactions`),
      requiredScope: "recurring_transaction:read",
    },
    {
      name: "Reconcile",
      mobileName: "Reconcile",
      icon: <DollarSign className="h-4 w-4" />,
      onClick: () => setShowReconciliationDialog(true),
      requiredScope: "reconciliation:create",
    },
    {
      name: "Add Transaction",
      mobileName: "New Transaction",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => {
        setSelectedTransaction(null);
        setTransactionDialogOpen(true);
      },
      requiredScope: "transaction:create",
    },
  ];

  // Filter actions based on permissions
  const allowedActions = actionItems.filter((item) =>
    checkScope(item.requiredScope),
  );

  if (allowedActions.length === 0) return null;

  return (
    <>
      <div className="flex justify-end">
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {allowedActions.map((action) => (
                <DropdownMenuItem
                  key={action.name}
                  onClick={action.onClick}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  <span>{action.mobileName}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            {allowedActions.map((action) => (
              <Button
                key={action.name}
                variant={
                  action.name === "Add Transaction" ? "default" : "outline"
                }
                onClick={action.onClick}
                className="flex items-center gap-2"
              >
                {action.icon}
                <span>{action.name}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        transaction={selectedTransaction}
      />
      <AddReconciliationDialog
        open={showReconciliationDialog}
        onOpenChange={setShowReconciliationDialog}
      />
    </>
  );
};
