"use client";

import InvalidInvitation from "@/components/invalid-invitation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle, Mail, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AcceptInvitationClient({
  inviteId,
}: {
  inviteId: string;
}) {
  const router = useRouter();

  // Fetch invitation details using useQuery
  const {
    data: invitation,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invitation", inviteId],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getInvitation({
        query: {
          id: inviteId,
        },
      });
      if (error) throw error;
      if (!data) throw new Error("No invitation data returned");
      return data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Mutation for accepting invitation
  const { mutate: acceptInvitation, isPending: isAccepting } = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId: inviteId,
      });

      if (error) throw error;

      toast.success("Successfully joined organization!");

      const { data: orgData, error: fetchOrgError } =
        await authClient.organization.getFullOrganization({
          query: { organizationId: data.invitation.organizationId },
        });
      if (fetchOrgError) {
        router.push("/");
      }
      router.push(`/${orgData?.slug}`);
    },
    onError: () => {
      toast.error("Failed to accept invitation");
    },
  });

  // Mutation for rejecting invitation
  const { mutate: rejectInvitation, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId: inviteId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation declined");
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to decline invitation");
    },
  });

  const processing = isAccepting || isRejecting;

  if (isLoading) {
    return (
      <div className="min-h-[80vh]  flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-7 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !invitation) {
    return <InvalidInvitation reason="not-found" />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Organization Invitation
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Organization
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {invitation.organizationName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => acceptInvitation()}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isAccepting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => rejectInvitation()}
              disabled={processing}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              size="lg"
            >
              {isRejecting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  Declining...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline Invitation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
