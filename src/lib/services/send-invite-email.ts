import InvitationEmail from "@/components/email-templates/invitation-template";
import type { User } from "better-auth";
import type { Invitation, Member, Organization } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DataProps {
  id: string;
  role: string;
  email: string;
  organization: Organization;
  invitation: Invitation;
  inviter: Member & {
    user: User;
  };
}

export async function sendInvitationEmail({
  id,
  role,
  email,
  organization,
  invitation,
  inviter,
}: DataProps) {
  const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invitations/${id}`;

  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        `${organization.name} <onboarding@resend.dev>`,
      to: process.env.NODE_ENV === "production" ? email : "demo@resend.dev",
      subject: `You've been invited to join ${organization.name}`,
      react: InvitationEmail({
        inviterName: inviter.user.name || inviter.user.email,
        inviterEmail: inviter.user.email,
        organizationName: organization.name,
        inviteLink: inviteLink,
      }),
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw error;
  }
}
