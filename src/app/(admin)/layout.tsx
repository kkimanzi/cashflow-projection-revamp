import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CustomTopbar from "../(public)/custom-topbar";

export default async function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { children } = props;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    redirect("/login");
  }

  if (!["admin", "owner"].includes(session.user.role || "")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomTopbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
