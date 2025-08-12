import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useOrganization({
  organizationSlug,
  organizationId,
}: {
  organizationSlug?: string;
  organizationId?: string;
} = {}) {
  const params = useParams() as { slug: string } | undefined;
  const slug = organizationSlug || params?.slug || organizationId;

  return useQuery({
    queryKey: ["organization", slug],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getFullOrganization(
        {
          query: organizationId
            ? { organizationId }
            : {
                organizationSlug: slug,
              },
        },
      );
      if (error) throw error;
      if (!data) {
        throw new Error("Organization not found");
      }
      return data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
