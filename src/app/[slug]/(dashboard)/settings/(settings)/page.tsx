"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { ProjectionSettings } from "./projection-settings";

export default function SettingsPage() {
  const { data: activeOrganization, isPending: isOrgLoading } =
    authClient.useActiveOrganization();

  return (
    // Added responsive horizontal padding (px-4 on small, md:px-6 on medium and up)
    <div className="px-4 py-6 space-y-6 md:px-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization preferences
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              {!isOrgLoading ? (
                <Input
                  disabled
                  id="org-name"
                  value={activeOrganization?.name}
                />
              ) : (
                <Skeleton className="h-10" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Organization Slug</Label>
              {!isOrgLoading ? (
                <Input
                  disabled
                  id="org-slug"
                  value={activeOrganization?.slug}
                />
              ) : (
                <Skeleton className="h-10" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {activeOrganization?.id && (
        <ProjectionSettings organizationId={activeOrganization.id} />
      )}
    </div>
  );
}
