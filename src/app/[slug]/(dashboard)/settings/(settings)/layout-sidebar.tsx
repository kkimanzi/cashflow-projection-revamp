"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ArrowLeft, Menu, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const SETTINGS_NAV_ITEMS = [
  {
    title: "General",
    href: "",
    icon: Settings,
  },
  {
    title: "Members & Permissions",
    href: "members",
    icon: Users,
  },
] as const;

function useOrganization() {
  const { data, isPending, error } = authClient.useActiveOrganization();
  return {
    orgSlug: data?.slug,
    isLoading: isPending,
    error,
  };
}

function SettingsSidebar() {
  const pathname = usePathname();
  const { orgSlug, isLoading } = useOrganization();
  const basePath = useMemo(
    () => (orgSlug ? `/${orgSlug}/settings` : ""),
    [orgSlug],
  );

  if (isLoading) {
    return (
      <Sidebar className="hidden md:block border-r fixed top-16 h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Sidebar>
    );
  }

  if (!orgSlug) {
    return null; // Or redirect to organization selection
  }

  return (
    <Sidebar className="hidden md:block border-r fixed top-16 h-[calc(100vh-4rem)]">
      <SidebarContent className="p-4">
        <SidebarMenu>
          {SETTINGS_NAV_ITEMS.map((item) => {
            const fullPath = `${basePath}/${item.href}`.replace(/\/+/g, "/");
            const isActive = pathname === fullPath;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={fullPath} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

function MobileNavHeader({ orgSlug }: { orgSlug?: string }) {
  const pathname = usePathname();
  return (
    <div className="md:hidden sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href={orgSlug ? `/${orgSlug}` : "/"} className="shrink-0">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-lg font-semibold truncate">Settings</h2>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open settings menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <nav className="p-4 space-y-1">
            {SETTINGS_NAV_ITEMS.map((item) => {
              const fullPath = orgSlug
                ? `/${orgSlug}/settings/${item.href}`.replace(/\/+/g, "/")
                : "#";
              const isActive = pathname === fullPath;
              return (
                <Link
                  key={item.href}
                  href={fullPath}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-accent",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgSlug } = useOrganization();
  return (
    <SidebarProvider>
      {/* Main container: flex, full width, min height */}
      <div className="flex min-h-screen w-full">
        <SettingsSidebar />
        {/* Main content area: takes remaining width, pushed by sidebar on desktop */}
        <div className="flex-1">
          <MobileNavHeader orgSlug={orgSlug} />
          {/* Main content wrapper: takes full width, allows children to define their own padding */}
          <main className="flex-1 overflow-auto">
            {/* Background div for content, ensures full width within main */}
            <div className="bg-background rounded-lg min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-8rem)] w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
