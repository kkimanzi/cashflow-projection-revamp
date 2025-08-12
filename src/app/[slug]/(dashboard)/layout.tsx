import NotFound from "@/app/not-found";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OrgActiveTopbar from "./org-active-topbar";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Verify session
    if (!session) {
      redirect("/login");
    }

    // Verify active organization
    const activeOrganizationId = session.session.activeOrganizationId;
    if (!activeOrganizationId) {
      redirect("/login");
    }

    try {
      // Verify organization slug matches active organization
      const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
      });
      if (!userOrganizations || userOrganizations.length === 0) {
        redirect("/");
      }

      const matchedOrg = userOrganizations.find(
        (org) => org.slug === params.slug,
      );
      if (!matchedOrg) {
        return <NotFound />;
      }

      if (matchedOrg.id !== activeOrganizationId) {
        try {
          await auth.api.setActiveOrganization({
            headers: await headers(),
            body: {
              organizationSlug: params.slug,
            },
          });
        } catch (error) {
          console.error("Failed to set active organization:", error);
          // If we can't set the active org, redirect to onboarding
          redirect("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
      // If there's an error (like user not being a member), redirect to onboarding
      redirect("/login");
    }

    return (
      <div className="min-h-screen bg-background">
        <OrgActiveTopbar slug={params.slug} />
        <main className="flex-1">{children}</main>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error in DashboardLayout:", error);
    // Fallback redirect if something unexpected happens
    redirect("/login");
  }
}
