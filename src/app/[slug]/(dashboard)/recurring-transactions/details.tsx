"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ConfirmationDialog,
  useConfirmation,
} from "@/components/ui/use-confirmation";
import type { RecurringTransactionTemplateWithCategoryDto } from "@/db/dto/recurring-transactions-template";
import { useScopeCheck } from "@/hooks/use-scope-check";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AddEditRecurringTransactionTemplateDialog from "./add-edit-recurring-transaction-template-dialog";

const fetchRecurringTemplates = async (): Promise<
  RecurringTransactionTemplateWithCategoryDto[]
> => {
  const response = await fetch("/api/recurring-transactions");
  if (!response.ok) {
    throw new Error("Failed to fetch recurring transaction templates");
  }
  const data = await response.json();
  return data.templates;
};

const deleteRecurringTemplate = async (
  id: string,
): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/recurring-transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete recurring template");
  }
  return response.json();
};

export default function RecurringTransactionTemplatesPage() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<RecurringTransactionTemplateWithCategoryDto | null>(null);
  const { confirm, dialogProps } = useConfirmation();
  const pathname = usePathname();
  const ledgerPath = pathname.replace("/recurring-transactions", "");
  const { checkScope } = useScopeCheck();

  // Check permissions
  const canCreate = checkScope("recurring_transaction:create");
  const canUpdate = checkScope("recurring_transaction:update");
  const canDelete = checkScope("recurring_transaction:delete");

  // Queries
  const {
    data: templates = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recurringTemplates"],
    queryFn: fetchRecurringTemplates,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteRecurringTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurringTemplates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setShowDialog(true);
  };

  const handleEditTemplate = (
    template: RecurringTransactionTemplateWithCategoryDto,
  ) => {
    if (!canUpdate) return;
    setEditingTemplate(template);
    setShowDialog(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!canDelete) return;
    confirm({
      title: "Delete Recurring Template",
      description:
        "Are you sure you want to delete this recurring template? This action cannot be undone.",
      onConfirm: () => {
        deleteMutation.mutate(id);
      },
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number.parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getFrequencyText = (
    frequency: string,
    interval: number,
    weekDays?: number[] | null,
    monthDay?: number | null,
  ) => {
    switch (frequency) {
      case "DAILY":
        return `Every ${interval} day${interval > 1 ? "s" : ""}`;
      case "WEEKLY": {
        const days = weekDays
          ? weekDays
              .map(
                (day) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
              )
              .join(", ")
          : "";
        return `Every ${interval} week${interval > 1 ? "s" : ""}${days ? ` on ${days}` : ""}`;
      }
      case "MONTHLY":
        return `Every ${interval} month${interval > 1 ? "s" : ""} on day ${monthDay}`;
      case "YEARLY":
        return `Every ${interval} year${interval > 1 ? "s" : ""}`;
      case "CUSTOM":
        return "Custom Pattern";
      default:
        return frequency;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Recurring Transaction Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Recurring Transaction Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-destructive">
              <p>Error loading templates: {error.message}</p>
              <Button
                onClick={() =>
                  queryClient.refetchQueries({
                    queryKey: ["recurringTemplates"],
                  })
                }
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost" className="gap-2">
            <Link href={ledgerPath}>
              <ChevronLeft className="h-4 w-4" />
              Back to Ledger
            </Link>
          </Button>
          {canCreate && (
            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring Template
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recurring Transaction Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    {(canUpdate || canDelete) && (
                      <TableHead className="text-center">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canUpdate || canDelete ? 8 : 7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No recurring transaction templates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {template.category.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {template.description || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              template.category.type === "MONEY_IN"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(template.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getFrequencyText(
                            template.frequency,
                            template.interval,
                            template.weekDays,
                            template.monthDay,
                          )}
                        </TableCell>
                        <TableCell>{formatDate(template.startDate)}</TableCell>
                        <TableCell>
                          {formatDate(template.endDate || "")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={template.isActive ? "default" : "outline"}
                            className={
                              template.isActive ? "" : "text-yellow-600"
                            }
                          >
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {(canUpdate || canDelete) && (
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTemplate(template)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteTemplate(template.id)
                                  }
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {canCreate && (
          <AddEditRecurringTransactionTemplateDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            onSave={() => {
              queryClient.invalidateQueries({
                queryKey: ["recurringTemplates"],
              });
            }}
            initialData={editingTemplate}
          />
        )}

        <ConfirmationDialog {...dialogProps} />
      </div>
    </div>
  );
}
