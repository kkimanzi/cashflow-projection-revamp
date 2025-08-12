// src/components/go-to-organization-btn.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { Building } from "lucide-react";
import Link from "next/link";

export default function GoToOrganizationBtn() {
  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();

  if (isPending) {
    return <Skeleton className="h-10 w-48" />;
  }

  if (!activeOrganization) {
    return null;
  }

  return (
    <Button variant="outline" className="flex items-center gap-2" asChild>
      <Link href={`/${activeOrganization.slug}`}>
        <Building className="h-4 w-4" />
        Go to Organization
      </Link>
    </Button>
  );
}
