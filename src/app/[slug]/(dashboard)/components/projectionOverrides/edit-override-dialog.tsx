"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const editOverrideSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !Number.isNaN(Number(val)), "Must be a valid number"),
  description: z.string().optional(),
  recurringTemplateId: z.string().min(1, "Template ID is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  skip: z.boolean().default(false).optional(),
});

type EditOverrideFormValues = z.infer<typeof editOverrideSchema>;

interface EditProjectionOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overrideId?: string;
  initialValues: {
    amount: string;
    description?: string;
    recurringTemplateId: string;
    date: string;
    skip?: boolean; // Added to match schema
  };
  onSuccess?: () => void;
}

export function EditProjectionOverrideDialog({
  open,
  onOpenChange,
  overrideId,
  initialValues,
  onSuccess,
}: EditProjectionOverrideDialogProps) {
  const form = useForm<EditOverrideFormValues>({
    resolver: zodResolver(editOverrideSchema),
    defaultValues: {
      amount: initialValues.amount,
      description: initialValues.description ?? "",
      recurringTemplateId: initialValues.recurringTemplateId,
      date: initialValues.date,
      skip: initialValues.skip ?? false, // Initialize with prop value
    },
  });

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: EditOverrideFormValues) => {
    try {
      setSubmitting(true);
      const url = overrideId
        ? `/api/projected-overrides/${overrideId}`
        : "/api/projected-overrides";
      const method = overrideId ? "PUT" : "POST";

      // Convert amount to string with fixed decimals if needed
      const payload = {
        ...data,
        amount: Number(data.amount).toFixed(2),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save override");
      }

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Submission Error:", error);
      // Consider adding toast notification here
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {overrideId ? "Edit Projection" : "Create Projection Override"}
          </DialogTitle>
          <DialogDescription>
            {overrideId
              ? "Modify this projected transaction"
              : "Override the default projection values for this date"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!form.watch("skip") && (
              <>
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
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? "0" : e.target.value;
                            field.onChange(value);
                          }}
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a description..."
                          className="resize-none"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="skip"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Skip this date</FormLabel>
                    <FormDescription>
                      {field.value
                        ? "This transaction will be omitted from projections"
                        : "Override amount and description for this date"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
