// src/app/projection-settings/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useMutation,
  useQuery,
  useQueryClient, // Import useQueryClient to invalidate queries
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Assuming these DTOs are correctly imported from your project
import type {
  ProjectionSettingsDto,
  UpdateProjectionSettingsDto,
} from "@/db/dto/projection-settings";

// In a real Next.js app, you'd get the organizationId from a session context, e.g., NextAuth.js useSession hook.
// For demonstration, we'll use a placeholder.
const ACTIVE_ORGANIZATION_ID = "org_12345"; // Replace with actual session.session.activeOrganizationId

// API calls for projection settings
const api = {
  getProjectionSettings: async (): Promise<ProjectionSettingsDto | null> => {
    const res = await fetch(
      `/api/projection-settings?organizationId=${ACTIVE_ORGANIZATION_ID}`,
    );
    if (res.status === 404) {
      return null; // No settings found, which is a valid initial state
    }
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch projection settings");
    }
    const data = await res.json();
    return data.settings;
  },
  updateProjectionSettings: async (
    data: UpdateProjectionSettingsDto,
  ): Promise<ProjectionSettingsDto> => {
    const res = await fetch("/api/projection-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "Failed to update projection settings",
      );
    }
    const result = await res.json();
    return result.settings;
  },
};

export default function ProjectionSettingsPage() {
  const queryClient = useQueryClient(); // Get the query client instance

  // Use useQuery to fetch projection settings
  const {
    data: settings,
    isLoading,
    error,
    refetch: fetchSettings, // Renamed from refetch to fetchSettings for clarity
  } = useQuery<ProjectionSettingsDto | null, Error>({
    queryKey: ["projectionSettings", ACTIVE_ORGANIZATION_ID],
    queryFn: api.getProjectionSettings,
    // Keep data fresh, but not too often for settings
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for static settings
  });

  const [formData, setFormData] = useState<UpdateProjectionSettingsDto>(() => ({
    // Initialize with default values, which will be overwritten by fetched settings
    defaultDaysToProject: 30,
    includePendingTransactions: true,
    includeRecurringTransactions: true,
  }));

  // Update form data when settings are loaded or change
  useEffect(() => {
    if (settings) {
      setFormData({
        defaultDaysToProject: settings.defaultDaysToProject,
        includePendingTransactions: settings.includePendingTransactions,
        includeRecurringTransactions: settings.includeRecurringTransactions,
      });
    }
  }, [settings]);

  // Use useMutation for updating projection settings
  const updateSettingsMutation = useMutation<
    ProjectionSettingsDto,
    Error,
    UpdateProjectionSettingsDto
  >({
    mutationFn: api.updateProjectionSettings,
    onSuccess: (data) => {
      // Invalidate the query to refetch fresh data or update cache directly
      queryClient.invalidateQueries({
        queryKey: ["projectionSettings", ACTIVE_ORGANIZATION_ID],
      });
      toast.success("Projection settings saved successfully!");
    },
    onError: (err) => {
      console.error("Failed to save settings:", err);
      toast.error(`Failed to save projection settings: ${err.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : Number.parseInt(value, 10) || value,
    }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading projection settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <p className="text-lg">Error loading projection settings:</p>
        <p className="text-sm">{error.message}</p>
        <Button onClick={() => fetchSettings()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Projection Settings
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label htmlFor="defaultDaysToProject" className="md:col-span-2">
              Default Days to Project
            </Label>
            <Input
              id="defaultDaysToProject"
              type="number"
              value={formData.defaultDaysToProject ?? ""}
              onChange={handleChange}
              className="md:col-span-1"
              min={1}
              required
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
              checked={formData.includePendingTransactions ?? false}
              onCheckedChange={(checked) =>
                handleSwitchChange("includePendingTransactions", checked)
              }
              className="md:col-span-1 justify-self-start md:justify-self-end"
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
              checked={formData.includeRecurringTransactions ?? false}
              onCheckedChange={(checked) =>
                handleSwitchChange("includeRecurringTransactions", checked)
              }
              className="md:col-span-1 justify-self-start md:justify-self-end"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
