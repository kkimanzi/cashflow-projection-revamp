"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  ProjectionSettingsDto,
  UpdateProjectionSettingsDto,
} from "@/db/dto/projection-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectionSettingsProps {
  organizationId: string;
}

const DEFAULT_SETTINGS: UpdateProjectionSettingsDto = {
  defaultDaysToProject: 30,
  includePendingTransactions: true,
  includeRecurringTransactions: true,
};

export function ProjectionSettings({
  organizationId,
}: ProjectionSettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] =
    useState<UpdateProjectionSettingsDto>(DEFAULT_SETTINGS);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Fetch current settings
  const {
    data: currentSettings,
    isLoading,
    error,
    isSuccess,
  } = useQuery<ProjectionSettingsDto | null, Error>({
    queryKey: ["projectionSettings", organizationId],
    queryFn: async () => {
      const res = await fetch(
        `/api/projection-settings?organizationId=${organizationId}`,
      );
      if (res.status === 404) return null;
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch settings");
      }
      return await res.json();
    },
    enabled: !!organizationId, // Only run query if organizationId exists
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (isSuccess) {
      if (currentSettings) {
        // Settings exist, use them
        setFormData({
          defaultDaysToProject: currentSettings.defaultDaysToProject,
          includePendingTransactions:
            currentSettings.includePendingTransactions,
          includeRecurringTransactions:
            currentSettings.includeRecurringTransactions,
        });
      } else {
        // No settings found (404), use defaults
        setFormData(DEFAULT_SETTINGS);
      }
      setIsFormInitialized(true);
    }
  }, [currentSettings, isSuccess]);

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProjectionSettingsDto) => {
      const res = await fetch("/api/projection-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update settings");
      }
      return await res.json();
    },
    onSuccess: (updatedSettings) => {
      // Update the query cache with the new data
      queryClient.setQueryData(
        ["projectionSettings", organizationId],
        updatedSettings,
      );
      toast.success("Settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      defaultDaysToProject: Number.isNaN(value) ? 0 : Math.max(1, value),
    }));
  };

  const handleSwitchChange = (field: keyof UpdateProjectionSettingsDto) => {
    return (checked: boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: checked,
      }));
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Show loading state while fetching initial data
  if (isLoading || !isFormInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading settings: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label htmlFor="defaultDaysToProject" className="md:col-span-2">
              Default Days to Project
            </Label>
            <Input
              id="defaultDaysToProject"
              type="number"
              min={1}
              value={formData.defaultDaysToProject}
              onChange={handleNumberChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label
              htmlFor="includePendingTransactions"
              className="md:col-span-2"
            >
              Include Pending Transactions
            </Label>
            <Switch
              id="includePendingTransactions"
              checked={formData.includePendingTransactions}
              onCheckedChange={handleSwitchChange("includePendingTransactions")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label
              htmlFor="includeRecurringTransactions"
              className="md:col-span-2"
            >
              Include Recurring Transactions
            </Label>
            <Switch
              id="includeRecurringTransactions"
              checked={formData.includeRecurringTransactions}
              onCheckedChange={handleSwitchChange(
                "includeRecurringTransactions",
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
