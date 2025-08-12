import InvalidInvitation from "@/components/invalid-invitation";
import { invitation, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AcceptInvitationClient from "./client";

export default async function AcceptInvitationPage(props: {
  params: Promise<{ inviteId: string }>;
}) {
  const params = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const fetchedInvitation = await db.query.invitation.findFirst({
    where: eq(invitation.id, params.inviteId),
  });

  if (!fetchedInvitation || fetchedInvitation.status !== "pending") {
    return (
      <InvalidInvitation
        reason={!fetchedInvitation ? "not-found" : "already-accepted"}
      />
    );
  }

  if (session && session.user.email !== fetchedInvitation.email) {
    return <InvalidInvitation reason={"not-found"} />;
  }

  const fetchedUser = await db.query.user.findFirst({
    where: eq(user.email, fetchedInvitation.email),
  });

  if (!fetchedUser) {
    redirect(
      `/signup?inviteId=${params.inviteId}&email=${encodeURIComponent(fetchedInvitation.email)}`,
    );
  }

  if (!session) {
    redirect(`/login?nextUrl=/invitations/${params.inviteId}`);
  }

  return (
    <div className="container mx-auto py-6">
      <AcceptInvitationClient inviteId={params.inviteId} />
    </div>
  );
}
