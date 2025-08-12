"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { Settings } from "lucide-react";
import Link from "next/link";

export function OrgSettingsButton() {
  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  const hasPermission =
    session?.user?.role && ["owner", "admin"].includes(session.user.role);

  if (!activeOrganization || !hasPermission) return null;

  return (
    <Button variant="outline" className="flex items-center gap-2" asChild>
      <Link href={`/${activeOrganization.slug}/settings`}>
        <Settings className="h-4 w-4" />
        Organization Settings
      </Link>
    </Button>
  );
}
