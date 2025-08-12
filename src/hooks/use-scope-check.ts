import { authClient } from "@/lib/auth-client";
import type { Member } from "@/lib/auth-client";
import { type AppScope, hasScope } from "@/lib/scopes/scopes";
import { useQuery } from "@tanstack/react-query";

export const useScopeCheck = (requiredScope?: AppScope) => {
  const {
    data: member,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const result = await authClient.organization.getActiveMember();
      if (!result.data) throw result.error;
      return result.data as Member;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Get scopes as string (empty string if undefined)
  const memberScopes = member?.scopes || "";

  const checkScope = (scope: AppScope) => {
    if (isLoading || !memberScopes) return false;
    return hasScope(memberScopes, scope);
  };

  const hasRequiredScope = requiredScope ? checkScope(requiredScope) : false;

  return {
    hasScope: hasRequiredScope,
    scopes: memberScopes,
    scopesArray: memberScopes ? memberScopes.split(" ") : [], // Optional: provide array version if needed
    isLoading,
    error,
    member,
    checkScope,
  };
};
