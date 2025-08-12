"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Member } from "@/lib/auth-client";
import {
  type AppScope,
  SCOPE_GROUPS,
  type ScopeResource,
  getAllResources,
  getAllScopesForResource,
} from "@/lib/scopes/scopes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";

const isResourceFullySelected = (
  resource: string,
  selectedScopes: Set<string>,
): boolean => {
  const operations =
    SCOPE_GROUPS[resource as keyof typeof SCOPE_GROUPS].operations;
  return operations.every((operation) =>
    selectedScopes.has(`${resource}:${operation}`),
  );
};

const isResourcePartiallySelected = (
  resource: string,
  selectedScopes: Set<string>,
): boolean => {
  const operations =
    SCOPE_GROUPS[resource as keyof typeof SCOPE_GROUPS].operations;
  return (
    operations.some((operation) =>
      selectedScopes.has(`${resource}:${operation}`),
    ) && !isResourceFullySelected(resource, selectedScopes)
  );
};

const expandWildcardScopes = (storedScopes: string): Set<string> => {
  const expanded = new Set<string>();
  const allResources = getAllResources();
  const scopesArray = storedScopes ? storedScopes.split(" ") : [];

  if (scopesArray.includes("*:*")) {
    allResources.forEach((resource) => {
      getAllScopesForResource(resource).forEach((scope) => expanded.add(scope));
    });
  } else {
    scopesArray.forEach((scope) => {
      const [resource, operation] = scope.split(":");
      if (operation === "*") {
        // Expand resource wildcard
        if (resource in SCOPE_GROUPS) {
          getAllScopesForResource(resource as ScopeResource).forEach((s) =>
            expanded.add(s),
          );
        }
      } else {
        expanded.add(scope);
      }
    });
  }
  return expanded;
};

// Helper to simplify explicit scopes back to wildcards for storage
const simplifyScopes = (explicitScopes: Set<string>): string => {
  const simplified: Set<string> = new Set();
  const allResources = getAllResources();

  // Check for global wildcard
  const allPossibleExplicitScopes = new Set<string>();
  allResources.forEach((resource) => {
    getAllScopesForResource(resource).forEach((scope) =>
      allPossibleExplicitScopes.add(scope),
    );
  });

  if (
    explicitScopes.size === allPossibleExplicitScopes.size &&
    Array.from(explicitScopes).every((scope) =>
      allPossibleExplicitScopes.has(scope),
    )
  ) {
    return "*:*";
  }

  // Check for resource wildcards
  allResources.forEach((resource) => {
    const resourceExplicitScopes = getAllScopesForResource(resource);
    const isResourceFullySelected = resourceExplicitScopes.every((scope) =>
      explicitScopes.has(scope),
    );

    if (isResourceFullySelected) {
      simplified.add(`${resource}:*`);
      // Remove these explicit scopes from the set to avoid re-adding them
      resourceExplicitScopes.forEach((scope) => explicitScopes.delete(scope));
    }
  });

  // Add any remaining explicit scopes
  explicitScopes.forEach((scope) => simplified.add(scope));

  return Array.from(simplified).join(" ");
};

export default function ScopeManager({
  member,
}: {
  member: Member;
}) {
  const queryClient = useQueryClient();
  // Initialize selectedScopes by expanding any wildcards from the member's stored scopes
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(() =>
    expandWildcardScopes(member.scopes || ""),
  );
  const [isOpen, setIsOpen] = useState(false);

  // Reset selectedScopes when dialog opens with potentially new member scopes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedScopes(expandWildcardScopes(member.scopes || ""));
    }
  }, [isOpen, member.scopes]);

  const { mutate: updateScopes, isPending: isUpdating } = useMutation({
    mutationFn: async (scopes: string) => {
      // Directly call the API endpoint defined in the BetterAuth plugin
      const response = await fetch(
        "/api/auth/organization/update-member-scopes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: member.id, scopes }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update scopes");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Member scopes updated successfully");
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update scopes");
    },
  });

  const handleScopeToggle = (scope: string) => {
    const newScopes = new Set(selectedScopes);
    if (newScopes.has(scope)) {
      newScopes.delete(scope);
    } else {
      newScopes.add(scope);
    }
    setSelectedScopes(newScopes);
  };

  const handleSave = () => {
    // Simplify scopes before sending to API
    const scopesToSave = simplifyScopes(selectedScopes);
    updateScopes(scopesToSave);
  };

  const handleResourceToggle = (resource: string, checked: boolean) => {
    const newScopes = new Set(selectedScopes);
    const operations =
      SCOPE_GROUPS[resource as keyof typeof SCOPE_GROUPS].operations;

    operations.forEach((operation) => {
      const scope = `${resource}:${operation}`;
      if (checked) {
        newScopes.add(scope);
      } else {
        newScopes.delete(scope);
      }
    });

    setSelectedScopes(newScopes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-1" />
          Manage Scopes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Scopes for {member.user.name || member.user.email}
          </DialogTitle>
          <DialogDescription>
            Configure what this member can access and modify in your
            organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(SCOPE_GROUPS).map(([resource, config]) => {
            const isFullySelected = isResourceFullySelected(
              resource,
              selectedScopes,
            );
            const isPartiallySelected = isResourcePartiallySelected(
              resource,
              selectedScopes,
            );

            return (
              <div key={resource} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`resource-${resource}`}
                    checked={isFullySelected}
                    ref={(el) => {
                      const input = el?.querySelector(
                        'input[type="checkbox"]',
                      ) as HTMLInputElement;
                      if (input) {
                        input.indeterminate = isPartiallySelected;
                      }
                    }}
                    onCheckedChange={(checked) =>
                      handleResourceToggle(resource, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`resource-${resource}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {config.label}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  {config.description}
                </p>

                <div className="ml-6 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {config.operations.map((operation) => {
                    const scope = `${resource}:${operation}` as AppScope;
                    const isSelected = selectedScopes.has(scope);

                    return (
                      <div
                        key={operation}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={scope}
                          checked={isSelected}
                          onCheckedChange={() => handleScopeToggle(scope)}
                        />
                        <Label
                          htmlFor={scope}
                          className="text-xs cursor-pointer capitalize"
                        >
                          {operation}
                        </Label>
                      </div>
                    );
                  })}
                </div>

                <Separator />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedScopes.size} scope{selectedScopes.size !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
