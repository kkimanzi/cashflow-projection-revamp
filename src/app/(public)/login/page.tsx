import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.session) {
    const userOrganizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    async function redirectToDefaultOrg() {
      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationId: userOrganizations[0].id,
        },
      });
      redirect(userOrganizations[0].slug);
    }

    if (userOrganizations.length > 0) {
      const matchedOrg = userOrganizations.find(
        (org) => org.id === (session.session.activeOrganizationId ?? ""),
      );
      if (matchedOrg) {
        redirect(`/${matchedOrg.slug}`);
      }
      await redirectToDefaultOrg();
    } else {
      if (session.user.isPayingCustomer) {
        redirect("/onboarding");
      }
      redirect("/");
    }
  }

  return <LoginClient />;
}
