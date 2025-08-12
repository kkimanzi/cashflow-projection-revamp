import PasswordResetEmail from "@/components/email-templates/password-reset-template";
import type { User } from "better-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ResetPasswordProps {
  user: User;
  url: string;
}

export async function sendPasswordResetEmail({
  user,
  url,
}: ResetPasswordProps) {
  try {
    const { data, error } = await resend.emails.send({
      // from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
      // to: user.email,
      from: "onboarding@resend.dev", // Must use resend.dev or verified domain
      to: "demo@resend.dev", // Must use test domain
      subject: "Reset your password",
      react: PasswordResetEmail({
        userName: user.name || user.email,
        resetLink: url,
        supportEmail: process.env.SUPPORT_EMAIL,
      }),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
