export type OrganizationReturnedType = {
  id: string;
  name: string;
  slug: string;
};

export function isOrganizationReturnedType(
  obj: unknown,
): obj is OrganizationReturnedType {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const castedObj = obj as Record<string, unknown>;
  return (
    typeof castedObj.id === "string" &&
    typeof castedObj.name === "string" &&
    typeof castedObj.slug === "string"
  );
}
