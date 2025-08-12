// components/authorized.tsx
"use client";

import { useScopeCheck } from "@/hooks/use-scope-check";
import type { AppScope } from "@/lib/scopes/scopes";
import { Loader2 } from "lucide-react";
import { Unauthorized } from "./not-authorized";

interface AuthorizedProps {
  children: React.ReactNode;
  scopes: AppScope | AppScope[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function Authorized({
  children,
  scopes,
  fallback = <Unauthorized />,
  loadingFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
}: AuthorizedProps) {
  const { checkScope, isLoading, error } = useScopeCheck();

  // Handle loading state
  if (isLoading) return <>{loadingFallback}</>;

  // Handle error states
  if (error) {
    return (
      <Unauthorized
        title="Permission Error"
        message="Failed to verify your access privileges"
      />
    );
  }

  const requiredScopes = Array.isArray(scopes) ? scopes : [scopes];
  const isAuthorized = requiredScopes.some((scope) => checkScope(scope));

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}
