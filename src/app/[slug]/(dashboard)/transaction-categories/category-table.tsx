"use client";
import { queryClient } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TransactionCategoryDto } from "@/db/dto/transaction-category";
import { useScopeCheck } from "@/hooks/use-scope-check";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
} from "@dnd-kit/core";
import { useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryTableRow } from "./category-table-row";

// API calls
const fetchCategories = async (): Promise<TransactionCategoryDto[]> => {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.categories.sort(
    (a: TransactionCategoryDto, b: TransactionCategoryDto) =>
      (a.displayPriority ?? Number.POSITIVE_INFINITY) -
      (b.displayPriority ?? Number.POSITIVE_INFINITY),
  );
};

const updateCategoryPrecedence = async (
  updates: {
    categoryId: string;
    displayPriority: number | null;
  }[],
) => {
  const res = await fetch("/api/categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update precedence");
  return { success: true };
};

export function CategoryTable() {
  const { checkScope } = useScopeCheck();
  const canEdit = checkScope("transaction_category:update");
  const canDelete = checkScope("transaction_category:delete");
  const canReorder = checkScope("transaction_category:update");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Queries
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<TransactionCategoryDto[], Error>({
    queryKey: ["transactionCategories"],
    queryFn: fetchCategories,
  });

  // Mutations
  const precedenceMutation = useMutation({
    mutationFn: updateCategoryPrecedence,
    onMutate: async (updates) => {
      // Show loading toast
      toast.loading("Updating category order...", {
        id: "update-precedence",
      });

      await queryClient.cancelQueries({ queryKey: ["transactionCategories"] });
      const previousCategories = queryClient.getQueryData<
        TransactionCategoryDto[]
      >(["transactionCategories"]);

      if (previousCategories) {
        queryClient.setQueryData(
          ["transactionCategories"],
          previousCategories
            .map((cat) => ({
              ...cat,
              displayPriority:
                updates.find((u) => u.categoryId === cat.id)?.displayPriority ??
                cat.displayPriority,
            }))
            .sort(
              (a, b) =>
                (a.displayPriority ?? Number.POSITIVE_INFINITY) -
                (b.displayPriority ?? Number.POSITIVE_INFINITY),
            ),
        );
      }
      return { previousCategories };
    },
    onSuccess: () => {
      // Update toast to success
      toast.success("Category order updated successfully!", {
        id: "update-precedence",
      });
    },
    onError: (error: Error, _, context) => {
      // Update toast to error
      toast.error(error.message, {
        id: "update-precedence",
      });

      if (context?.previousCategories) {
        queryClient.setQueryData(
          ["transactionCategories"],
          context.previousCategories,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
    const updates = reorderedCategories.map((cat, index) => ({
      categoryId: cat.id,
      displayPriority: index,
    }));

    precedenceMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-destructive">
          <p className="text-lg">Error loading categories:</p>
          <p className="text-sm">{error.message}</p>
          <Button
            onClick={() =>
              queryClient.refetchQueries({
                queryKey: ["transactionCategories"],
              })
            }
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <DndContext
        sensors={canReorder ? sensors : []}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {canReorder && (
                  <TableHead className="w-[120px]">Precedence</TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[200px]">Description</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <CategoryTableRow
                    key={category.id}
                    category={category}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canReorder={canReorder}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
      {precedenceMutation.isPending && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating category order...
        </div>
      )}
    </div>
  );
}
