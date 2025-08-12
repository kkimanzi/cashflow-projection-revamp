"use client";

import { queryClient } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateTransactionCategoryDto,
  TransactionCategoryDto,
  UpdateTransactionCategoryDto,
} from "@/db/dto/transaction-category";
import { useMutation } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: TransactionCategoryDto | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEdit = !!category;
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    type: category?.type || "MONEY_OUT",
    isSystem: category?.isSystem || false,
  });

  const createCategory = async (data: CreateTransactionCategoryDto) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data }),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  };

  const updateCategory = async (
    id: string,
    data: UpdateTransactionCategoryDto,
  ) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onMutate: () => {
      toast.loading("Creating category...", { id: "category-toast" });
    },
    onSuccess: () => {
      toast.success("Category created successfully!", { id: "category-toast" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message, { id: "category-toast" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: UpdateTransactionCategoryDto }) =>
      updateCategory(id, data),
    onMutate: () => {
      toast.loading("Updating category...", { id: "category-toast" });
    },
    onSuccess: () => {
      toast.success("Category updated successfully!", { id: "category-toast" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message, { id: "category-toast" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      updateMutation.mutate({
        id: category.id,
        data: {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          isSystem: formData.isSystem,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        isSystem: formData.isSystem,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: "MONEY_IN" | "MONEY_OUT") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONEY_IN">Money In</SelectItem>
                <SelectItem value="MONEY_OUT">Money Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
