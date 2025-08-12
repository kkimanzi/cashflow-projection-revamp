import { Unauthorized } from "@/components/not-authorized";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SettingsLayout from "./layout-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeMember = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!activeMember) {
    redirect("/");
  }

  if (!["admin", "owner"].includes(activeMember.role)) {
    return (
      <Unauthorized
        title="Insufficient Permissions"
        message="You need admin or owner privileges to access this page"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SettingsLayout>{children}</SettingsLayout>
    </div>
  );
}
