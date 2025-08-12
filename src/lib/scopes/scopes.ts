// src/types/scopes.ts
export const SCOPE_GROUPS = {
  transaction: {
    label: "Transactions",
    description: "Manage financial transactions",
    operations: ["create", "read", "read:own", "update", "delete"] as const,
  },
  transaction_category: {
    label: "Transaction Categories",
    description: "Manage transaction categories",
    operations: ["create", "read", "update", "delete"] as const,
  },
  reconciliation: {
    label: "Reconciliation",
    description: "Manage account reconciliation",
    operations: ["create", "read", "update", "delete"] as const,
  },
  recurring_transaction: {
    label: "Recurring Transactions",
    description: "Manage recurring transactions",
    operations: ["create", "read", "update", "delete"] as const,
  },
  projection_settings: {
    label: "Projection Settings",
    description: "Manage projection configuration",
    operations: ["create", "read", "update", "delete"] as const,
  },
  projection: {
    label: "Projections",
    description: "View and update financial projections",
    operations: ["read", "update"] as const,
  },
} as const;

export type ScopeResource = keyof typeof SCOPE_GROUPS;
export type ScopeOperation =
  (typeof SCOPE_GROUPS)[ScopeResource]["operations"][number];

export type AppScope =
  | `transaction:${"create" | "read" | "read:own" | "update" | "delete"}`
  | `transaction_category:${"create" | "read" | "update" | "delete"}`
  | `reconciliation:${"create" | "read" | "update" | "delete"}`
  | `recurring_transaction:${"create" | "read" | "update" | "delete"}`
  | `projection_settings:${"create" | "read" | "update" | "delete"}`
  | `projection:${"read" | "update"}`
  | `${ScopeResource}:*` // Resource wildcard
  | `*:*`; // Global wildcard

// Define operation hierarchy - higher level operations include lower level ones
const OPERATION_HIERARCHY: Record<string, string[]> = {
  // Write operations include read:own by default (they can manage their own records)
  create: ["read:own"],
  update: ["read:own"],
  delete: ["read:own"],
  // Full read includes own read
  read: ["read:own"],
};

// Write operations that should be granted by '*:write'
const WRITE_OPERATIONS = new Set(["create", "update", "delete"]);

// Read operations that should be granted by '*:read'
const READ_OPERATIONS = new Set(["read", "read:own"]);

// Helper to convert space-separated string to array
const parseScopes = (scopes: string): string[] => {
  return scopes.trim() ? scopes.split(" ") : [];
};

export const hasScope = (
  userScopes: string,
  requiredScope: AppScope,
): boolean => {
  const scopesArray = parseScopes(userScopes);
  const [requiredResource, requiredOperation] = requiredScope.split(":") as [
    string,
    string,
  ];

  // 1. Global super admin check
  if (scopesArray.includes("*:*")) return true;

  // 2. Exact match check
  if (scopesArray.includes(requiredScope)) return true;

  // 3. Resource-level wildcard (e.g., 'transaction:*')
  if (scopesArray.includes(`${requiredResource}:*`)) return true;

  // 4. Operation-level wildcards
  if (READ_OPERATIONS.has(requiredOperation)) {
    if (scopesArray.includes("*:read")) return true;
  } else if (WRITE_OPERATIONS.has(requiredOperation)) {
    if (scopesArray.includes("*:write")) return true;
  }

  // 5. Check hierarchy - see if user has a higher-level permission
  for (const userScope of scopesArray) {
    const [userResource, userOperation] = userScope.split(":");

    // Must be same resource (or global wildcard already checked above)
    if (userResource !== requiredResource) continue;

    // Check if user's operation includes the required operation
    const includedOperations = OPERATION_HIERARCHY[userOperation] || [];
    if (includedOperations.includes(requiredOperation)) {
      return true;
    }
  }

  return false;
};

// Helper function to check multiple scopes (any match)
export const hasAnyScope = (
  userScopes: string,
  requiredScopes: AppScope[],
): boolean => {
  return requiredScopes.some((scope) => hasScope(userScopes, scope));
};

// Helper function to check multiple scopes (all must match)
export const hasAllScopes = (
  userScopes: string,
  requiredScopes: AppScope[],
): boolean => {
  return requiredScopes.every((scope) => hasScope(userScopes, scope));
};

// Helper to get effective permissions for debugging
export const getEffectivePermissions = (userScopes: string): string[] => {
  const scopesArray = parseScopes(userScopes);
  const effective = new Set<string>();

  // Add all direct scopes
  scopesArray.forEach((scope) => effective.add(scope));

  // Add implied permissions based on hierarchy
  scopesArray.forEach((scope) => {
    const [resource, operation] = scope.split(":");
    const impliedOps = OPERATION_HIERARCHY[operation] || [];

    impliedOps.forEach((impliedOp) => {
      effective.add(`${resource}:${impliedOp}`);
    });
  });

  return Array.from(effective).sort();
};

// Utility to validate scope format
export const isValidScope = (scope: string): scope is AppScope => {
  const [resource, operation] = scope.split(":");

  // Check for global wildcard
  if (scope === "*:*") return true;

  // Check for resource wildcard
  if (operation === "*") {
    return Object.keys(SCOPE_GROUPS).includes(resource);
  }

  // Check for explicit scope
  if (!(resource in SCOPE_GROUPS)) return false;
  const validOperations = SCOPE_GROUPS[resource as ScopeResource].operations;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return validOperations.includes(operation as any);
};

// Helper to get all explicit scopes for a given resource
export const getAllScopesForResource = (
  resource: ScopeResource,
): AppScope[] => {
  return SCOPE_GROUPS[resource].operations.map(
    (op) => `${resource}:${op}` as AppScope,
  );
};

// Helper to get all available resources
export const getAllResources = (): ScopeResource[] => {
  return Object.keys(SCOPE_GROUPS) as ScopeResource[];
};

// Helper to join scopes array into space-separated string
export const joinScopes = (scopes: string[]): string => {
  return scopes.join(" ");
};

// Helper to filter valid scopes from a space-separated string
export const filterValidScopes = (scopes: string): string => {
  const validScopes = parseScopes(scopes).filter(isValidScope);
  return joinScopes(validScopes);
};

// Helper to check if a scope is an "own" scope (for ownership-based filtering)
export const isOwnScope = (scope: string): boolean => {
  return scope.includes(":own");
};

// Helper to get the base scope from an "own" scope
export const getBaseScopeFromOwn = (scope: string): string => {
  return scope.replace(":own", "");
};
