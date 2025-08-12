// app/(dashboard)/onboarding/onboarding-client.tsx
"use client";

import { CreateOrganizationDialog } from "@/app/[slug]/(dashboard)/create-organization-dialog";

export function OnboardingClient() {
  return (
    <div>
      <CreateOrganizationDialog open={true} onOpenChange={() => {}} />
    </div>
  );
}
