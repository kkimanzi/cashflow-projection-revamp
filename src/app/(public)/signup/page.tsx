import InvalidInvitation from "@/components/invalid-invitation";
// app/signup/page.tsx
import { invitation } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import SignupForm from "./form";

export default async function SignupPage(props: {
  searchParams: Promise<{ inviteId?: string; email?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Block access if no inviteId is provided
  if (!searchParams.inviteId) {
    return <InvalidInvitation reason="required" />;
  }

  // Validate invitation
  const fetchedInvitation = await db.query.invitation.findFirst({
    where: eq(invitation.id, searchParams.inviteId),
  });

  // Handle invalid invitation states
  if (!fetchedInvitation) {
    return <InvalidInvitation reason="not-found" />;
  }

  if (fetchedInvitation.status !== "pending") {
    return <InvalidInvitation reason="already-accepted" />;
  }

  // Enforce email matching
  if (searchParams.email !== fetchedInvitation.email) {
    redirect(
      `/signup?inviteId=${searchParams.inviteId}&email=${encodeURIComponent(fetchedInvitation.email)}`,
    );
  }

  return (
    <div className="container mx-auto py-6">
      <SignupForm inviteId={searchParams.inviteId} email={searchParams.email} />
    </div>
  );
}
