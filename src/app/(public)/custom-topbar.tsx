// src/app/custom-topbar.tsx
import PublicTopBar from "@/components/public-topbar";
import { auth } from "@/lib/auth";
import { BarChart3 } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import UserMenu from "../[slug]/(dashboard)/user-menu";
import GoToOrganizationBtn from "./go-to-organization-btn";

export default async function CustomTopbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <PublicTopBar />;
  }

  const sessionActiveOrganizationId = session.session.activeOrganizationId;
  if (sessionActiveOrganizationId) {
    return <LoggedInPublicTopbar />;
  }

  return <PublicTopBar />;
}

export async function LoggedInPublicTopbar() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link className="flex items-center gap-2 mr-6" href="/">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">
              Dira Cash
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
            <GoToOrganizationBtn />
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
