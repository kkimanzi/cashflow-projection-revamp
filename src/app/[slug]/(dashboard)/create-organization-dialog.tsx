"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import slugify from "@sindresorhus/slugify";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { queryClient } from "../../providers";

// Define the expected response shape from the custom backend
interface CreateOrganizationResponse {
  data: {
    success?: boolean;
    organization?: {
      id: string;
      name: string;
      slug: string;
    };
    error?: string;
  };
  error?: string;
}

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      setSlug(slugify(name.toLowerCase()));
    } else {
      setSlug("");
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs client-side
      if (!name.trim()) {
        throw new Error("Organization name is required");
      }
      if (!slug.trim()) {
        throw new Error("Organization slug is required");
      }

      await handleCreateOrganization(name.trim(), slug.trim());
      // Reset form on success
      setName("");
      setSlug("");
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      setError(
        err.message ||
          err?.response?.data?.error ||
          "Failed to create organization. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (name: string, slug: string) => {
    try {
      // Check slug availability
      const checkSlugResponse = await authClient.organization.checkSlug({
        slug,
      });
      if (checkSlugResponse.error || !checkSlugResponse.data.status) {
        throw new Error(
          checkSlugResponse.error?.message || "Slug is already taken",
        );
      }

      if (slug.toLowerCase() === "admin") {
        throw new Error("Slug is already taken");
      }

      // Create organization using standard authClient flow
      const createResponse = await authClient.organization.create({
        name,
        slug,
      });

      if (createResponse.error || !createResponse.data) {
        throw new Error(
          createResponse.error?.message || "Failed to create organization",
        );
      }

      // Switch to the newly created organization
      await authClient.organization.setActive({
        organizationId: createResponse.data.id,
      });

      // Refetch the organizations list
      await queryClient.invalidateQueries({ queryKey: ["user-organizations"] });
      router.push(`/${createResponse.data.slug}`);
      onOpenChange(false);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      console.error("Failed to create organization:", error);
      throw new Error(error.message || "An unexpected error occurred");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form when dialog closes
        setName("");
        setSlug("");
        setError("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to manage its cash flow. You can invite
            other members later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(""); // Clear error on input change
                }}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                placeholder="organization-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setError(""); // Clear error on input change
                }}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be used in your organization URL (3-50 characters,
                lowercase, alphanumeric, hyphens)
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
