import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { OrgSettingsButton } from "./org-settings-btn";
import OrgPicker from "./org-picker";
import UserMenu from "./user-menu";

interface OrgActiveTopbarProps {
  slug?: string;
  params?: {
    slug?: string;
  };
}

export default function OrgActiveTopbar({
  slug,
  params,
}: OrgActiveTopbarProps) {
  const activeSlug = params?.slug ?? slug;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Link
          className="flex items-center gap-2 mr-6"
          href={`/${activeSlug ?? ""}`}
        >
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline">Dira Cash</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
          <OrgPicker />
          <OrgSettingsButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
