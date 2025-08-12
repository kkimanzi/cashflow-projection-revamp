"use client";
import { queryClient } from "@/app/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import type { TransactionCategoryDto } from "@/db/dto/transaction-category";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Edit, GripVertical, Loader2, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import { CategoryFormDialog } from "./category-form-dialog";

interface CategoryTableRowProps {
  category: TransactionCategoryDto;
  canEdit: boolean;
  canDelete: boolean;
  canReorder: boolean;
}

export function CategoryTableRow({
  category,
  canEdit,
  canDelete,
  canReorder,
}: CategoryTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={style}
        className={`hover:bg-muted ${isDragging ? "z-50" : ""}`}
      >
        {canReorder && (
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              <button
                className="cursor-grab hover:text-muted-foreground active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                {category.displayPriority ?? "—"}
              </span>
            </div>
          </TableCell>
        )}
        <TableCell>
          <div className="flex items-center gap-2">
            {category.name}
            {category.isSystem && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={category.type === "MONEY_IN" ? "default" : "outline"}>
            {category.type === "MONEY_IN" ? "Money In" : "Money Out"}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground max-w-xs truncate">
          {category.description || "—"}
        </TableCell>
        {(canEdit || canDelete) && (
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUpdateOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDelete && !category.isSystem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>
      <CategoryFormDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        category={category}
      />

      <DeleteDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        category={category}
      />
    </>
  );
}

export function DeleteDialog({
  open,
  setOpen,
  category,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  category: TransactionCategoryDto;
}) {
  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete category");
    return { success: true };
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: () => {
      toast.loading("Deleting category...");
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(category.id);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isDeleting) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete the category "{category.name}"? This
            action cannot be undone and may affect existing transactions.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
