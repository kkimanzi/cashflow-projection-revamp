import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  if (session.session.activeOrganizationId) {
    //redirect(session.session.activeOrganizationId);
  }

  return (
    <div>
      <OnboardingClient />
    </div>
  );
}
