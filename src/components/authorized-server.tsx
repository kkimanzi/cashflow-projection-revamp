// components/authorized-server.tsx
import { auth } from "@/lib/auth";
import { type AppScope, hasScope } from "@/lib/scopes/scopes";
import { headers } from "next/headers";
import { Unauthorized } from "./not-authorized";

interface AuthorizedServerProps {
  children: React.ReactNode;
  scopes: AppScope | AppScope[];
  fallback?: React.ReactNode;
}

export async function AuthorizedServer({
  children,
  scopes,
  fallback = <Unauthorized />,
}: AuthorizedServerProps) {
  const activeMember = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!activeMember) {
    return (
      <Unauthorized
        title="Session Expired"
        message="Please log in again to continue"
        showBackButton={false}
      />
    );
  }

  // Type-safe scopes access with proper type assertion
  const memberScopes =
    "scopes" in activeMember && typeof activeMember.scopes === "string"
      ? activeMember.scopes
      : "";

  if (!memberScopes) {
    return (
      <Unauthorized
        title="Access Configuration Error"
        message="Your account permissions couldn't be verified"
        showBackButton={true}
      />
    );
  }

  const requiredScopes = Array.isArray(scopes) ? scopes : [scopes];
  const isAuthorized = requiredScopes.some((scope) =>
    hasScope(memberScopes, scope),
  );

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}
