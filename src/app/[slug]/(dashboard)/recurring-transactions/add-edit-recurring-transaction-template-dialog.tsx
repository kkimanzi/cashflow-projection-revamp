"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateRecurringTransactionTemplateDto,
  RecurringTransactionTemplateWithCategoryDto,
  UpdateRecurringTransactionTemplateDto,
} from "@/db/dto/recurring-transactions-template";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Create a form-specific schema that matches the UI needs and handles transformations
const recurringTemplateFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
      "Amount must be a positive number",
    ),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]),
  interval: z.number().int().min(1, "Interval must be at least 1"),
  startDate: z.date(),
  endDate: z.date().optional(),
  weekDays: z.array(z.number().int().min(0).max(6)),
  monthDay: z.number().int().min(1).max(31).optional(),
  customPattern: z.string().optional(),
  isActive: z.boolean(),
  isFixed: z.boolean(), // Added the new field
});

type RecurringTemplateFormValues = z.infer<typeof recurringTemplateFormSchema>;

interface AddEditRecurringTransactionTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  initialData?: RecurringTransactionTemplateWithCategoryDto | null;
}

interface CategoryOption {
  id: string;
  name: string;
  type: "MONEY_IN" | "MONEY_OUT";
}

export default function AddEditRecurringTransactionTemplateDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: AddEditRecurringTransactionTemplateDialogProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const form = useForm<RecurringTemplateFormValues>({
    resolver: zodResolver(recurringTemplateFormSchema),
    defaultValues: {
      categoryId: "",
      amount: "",
      description: "",
      frequency: "MONTHLY",
      interval: 1,
      startDate: new Date(),
      endDate: undefined,
      weekDays: [],
      monthDay: undefined,
      customPattern: "",
      isActive: true,
      isFixed: false, // Default to false for new transactions
    },
  });

  const frequency = form.watch("frequency");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      let customPatternString = "";
      if (initialData.customPattern) {
        try {
          customPatternString = JSON.stringify(
            initialData.customPattern,
            null,
            2,
          );
        } catch {
          customPatternString = "";
        }
      }

      form.reset({
        categoryId: initialData.categoryId,
        amount: initialData.amount,
        description: initialData.description || "",
        frequency: initialData.frequency,
        interval: initialData.interval,
        startDate: new Date(initialData.startDate),
        endDate: initialData.endDate
          ? new Date(initialData.endDate)
          : undefined,
        weekDays: initialData.weekDays || [],
        monthDay: initialData.monthDay || undefined,
        customPattern: customPatternString,
        isActive: initialData.isActive,
        isFixed: initialData.isFixed || false, // Initialize with existing value
      });
    } else {
      form.reset({
        categoryId: "",
        amount: "",
        description: "",
        frequency: "MONTHLY",
        interval: 1,
        startDate: new Date(),
        endDate: undefined,
        weekDays: [],
        monthDay: undefined,
        customPattern: "",
        isActive: true,
        isFixed: false,
      });
    }
  }, [open, initialData?.id, form]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again.");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const onSubmit = async (values: RecurringTemplateFormValues) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let customPattern: Record<string, any> | null = null;
      if (values.customPattern?.trim()) {
        try {
          customPattern = JSON.parse(values.customPattern);
        } catch {
          toast.error("Invalid JSON format in custom pattern");
          return;
        }
      }

      const payload:
        | CreateRecurringTransactionTemplateDto
        | UpdateRecurringTransactionTemplateDto = {
        categoryId: values.categoryId,
        amount: values.amount,
        description: values.description || null,
        frequency: values.frequency,
        interval: values.interval,
        startDate: values.startDate.toISOString().split("T")[0],
        endDate: values.endDate
          ? values.endDate.toISOString().split("T")[0]
          : null,
        weekDays:
          frequency === "WEEKLY" && values.weekDays.length > 0
            ? values.weekDays
            : null,
        monthDay:
          frequency === "MONTHLY" && values.monthDay ? values.monthDay : null,
        customPattern:
          frequency === "CUSTOM" && values.customPattern?.trim()
            ? JSON.parse(values.customPattern)
            : null,
        isActive: values.isActive,
        isFixed: values.isFixed, // Include the isFixed field
      };

      let response: Response;
      if (initialData?.id) {
        response = await fetch(
          `/api/recurring-transactions/${initialData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
      } else {
        response = await fetch("/api/recurring-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save template");
      }

      toast.success(
        `Recurring template ${initialData ? "updated" : "created"} successfully.`,
      );
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving recurring template:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const weekDayOptions = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Edit Recurring Transaction"
              : "Add Recurring Transaction"}
          </DialogTitle>
          <DialogDescription>
            Define the details for your recurring transaction template.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Loading categories..."
                              : "Select a category"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.type.replace("_", " ")})
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
                      placeholder="Enter a description for this recurring transaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFixed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Fixed Transaction
                    </FormLabel>
                    <FormDescription>
                      Mark as fixed for mandatory transactions (like loan
                      payments). Uncheck for projections (like expected income).
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

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>No end date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Leave empty for recurring transactions that never end
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency !== "CUSTOM" && (
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Repeat Every (
                      {frequency === "DAILY"
                        ? "days"
                        : frequency === "WEEKLY"
                          ? "weeks"
                          : frequency === "MONTHLY"
                            ? "months"
                            : "years"}
                      )
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      For example: Enter 2 to repeat every 2{" "}
                      {frequency === "DAILY"
                        ? "days"
                        : frequency === "WEEKLY"
                          ? "weeks"
                          : frequency === "MONTHLY"
                            ? "months"
                            : "years"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "WEEKLY" && (
              <FormField
                control={form.control}
                name="weekDays"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Days of the Week
                      </FormLabel>
                      <FormDescription>
                        Select which days of the week this transaction should
                        occur
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {weekDayOptions.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="weekDays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={
                                      field.value?.includes(item.value) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([
                                            ...currentValue,
                                            item.value,
                                          ])
                                        : field.onChange(
                                            currentValue.filter(
                                              (value) => value !== item.value,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "MONTHLY" && (
              <FormField
                control={form.control}
                name="monthDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of the Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="15"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? Number(value) : undefined);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the day of the month (1-31). If the month doesn't
                      have this day, it will use the last day of the month.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "CUSTOM" && (
              <FormField
                control={form.control}
                name="customPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Pattern (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"type": "specific_dates", "dates": ["2024-01-15", "2024-02-15"]}'
                        className="font-mono text-sm"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Define a custom recurrence pattern using JSON format. This
                      is for advanced use cases.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable or disable this recurring transaction template.
                      Disabled templates won't generate transactions.
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Save Changes"
                    : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
