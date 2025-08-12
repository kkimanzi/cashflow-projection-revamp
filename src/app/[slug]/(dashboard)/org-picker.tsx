"use client";
import { queryClient } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronDown, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateOrganizationDialog } from "./create-organization-dialog";

export default function OrgPicker() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [isSwitching, setIsSwitching] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["get-current-user"],
    queryFn: async () => {
      const session = await authClient.getSession();
      if (!session.data?.user) {
        throw new Error("No user session");
      }
      return session.data.user;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["user-organizations"],
    queryFn: async () => {
      const userOrganisations = await authClient.organization.list();
      return {
        userOrganisations: userOrganisations.data,
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  async function handleOrganizationSwitch({
    id,
    slug,
  }: { id: string; slug: string }) {
    setIsSwitching(true);
    try {
      await authClient.organization.setActive({ organizationId: id });
      await queryClient.resetQueries();
      queryClient.removeQueries();
      await queryClient.removeQueries({ queryKey: ["get-current-user"] });
      await queryClient.removeQueries({ queryKey: ["user-organizations"] });
      await queryClient.removeQueries({ queryKey: ["organization"] });

      router.push(`/${slug}`);
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setIsSwitching(false);
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 max-w-[200px]">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    );
  }

  const { userOrganisations } = data;

  if (!userOrganisations || userOrganisations.length === 0) {
    return (
      <>
        <Button
          variant="outline"
          className="flex items-center gap-2 max-w-[200px]"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="truncate">Create Account</span>
        </Button>
        <CreateOrganizationDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 max-w-[200px]"
            disabled={isSwitching}
          >
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {isSwitching
                ? "Switching..."
                : activeOrganization?.name || "Select Organization"}
            </span>
            {isSwitching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>Your Accounts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userOrganisations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleOrganizationSwitch(org)}
              className="flex items-center gap-2"
              disabled={isSwitching}
            >
              <Building2 className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{org.name}</span>
                <span className="text-xs text-muted-foreground">
                  /{org.slug}
                </span>
              </div>
              {activeOrganization?.id === org.id &&
                (isSwitching ? (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                ) : (
                  <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                ))}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!currentUser?.isPayingCustomer || isSwitching}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}
