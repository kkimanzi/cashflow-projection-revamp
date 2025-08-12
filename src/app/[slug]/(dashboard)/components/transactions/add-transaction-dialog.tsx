"use client";

import { queryClient } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateTransactionDto,
  type UpdateTransactionDto,
  createTransactionSchema,
  updateTransactionSchema,
} from "@/db/dto/transaction";
import type { TransactionWithCategoryDto } from "@/db/dto/transaction";
import type { TransactionCategoryDto } from "@/db/dto/transaction-category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionWithCategoryDto | null;
}

const fetchCategories = async (): Promise<TransactionCategoryDto[]> => {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.categories || [];
};

export default function TransactionDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDialogProps) {
  const {
    data: categories = [],
    isLoading: loading,
    error: categoriesError,
  } = useQuery<TransactionCategoryDto[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      return data.categories || [];
    },
    enabled: open, // Only fetch when dialog is open
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateTransactionDto | UpdateTransactionDto>({
    resolver: zodResolver(
      transaction ? updateTransactionSchema : createTransactionSchema,
    ),
    defaultValues: {
      categoryId: transaction?.categoryId || "",
      date: transaction?.date || format(new Date(), "yyyy-MM-dd"),
      amount: transaction?.amount || "",
      description: transaction?.description || "",
      type: transaction?.category.type || "MONEY_OUT",
    },
  });

  useEffect(() => {
    if (open && transaction) {
      form.reset({
        categoryId: transaction.categoryId,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.category.type,
      });
    }
  }, [open, transaction]);

  const onSubmit = async (
    data: CreateTransactionDto | UpdateTransactionDto,
  ) => {
    try {
      setSubmitting(true);
      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : "/api/transactions";
      const method = transaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save transaction");
      }

      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["ledgerData"] });
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (type: "MONEY_IN" | "MONEY_OUT") => {
    form.setValue("type", type);
    form.setValue("categoryId", "");
  };

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter(
    (category) => category.type === selectedType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update this transaction entry"
              : "Create a new transaction entry for your ledger"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select
                    onValueChange={handleTypeChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONEY_IN">Money In</SelectItem>
                      <SelectItem value="MONEY_OUT">Money Out</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading || !selectedType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter transaction description..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || loading}>
                {submitting
                  ? transaction
                    ? "Updating..."
                    : "Creating..."
                  : transaction
                    ? "Update Transaction"
                    : "Create Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
