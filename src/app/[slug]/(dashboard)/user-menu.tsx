"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { queryClient } from "@/app/providers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export default function UserMenu() {
  const router = useRouter();

  const {
    data: currentUser,
    isFetching,
    isError: fetchUserError,
    refetch,
  } = useQuery({
    queryKey: ["get-current-user"],
    queryFn: async () => {
      const session = await authClient.getSession();
      if (!session.data?.user) {
        throw new Error("No user session");
      }
      return session.data.user;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      await queryClient.resetQueries();
      queryClient.removeQueries();
      await queryClient.removeQueries({ queryKey: ["get-current-user"] });
      await queryClient.removeQueries({ queryKey: ["user-organizations"] });
      await queryClient.removeQueries({ queryKey: ["organization"] });
      router.refresh(); // Force refresh to clear client-side cache
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <Button variant="ghost" className="h-8 w-8 rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Error state
  if (fetchUserError || !currentUser) {
    return (
      <Button
        variant="ghost"
        className="h-8 w-8 rounded-full"
        onClick={() => router.push("/login")}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>!</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {currentUser.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {currentUser.name || "No name"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {currentUser.email || "No email"}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
