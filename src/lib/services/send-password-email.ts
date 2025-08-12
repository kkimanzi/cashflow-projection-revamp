import PasswordEmail from "@/components/email-templates/password-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordEmailProps {
  email: string;
  name?: string;
  password: string;
}

export async function sendPasswordEmail({
  email,
  name,
  password,
}: SendPasswordEmailProps) {
  const loginLink = `${process.env.NEXT_PUBLIC_SITE_URL}/login`; // Assuming your login page is at /login

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Your App <onboarding@resend.dev>", // Customize sender
      to:
        process.env.NODE_ENV === "production" ? email : "delivered@resend.dev", // Use a test email in development
      subject: "Your New Account Details",
      react: PasswordEmail({
        userName: name || email, // Use name if available, otherwise email
        userEmail: email,
        generatedPassword: password,
        loginLink: loginLink,
      }),
    });

    if (error) {
      console.error("Error sending password email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send password email:", error);
    throw error;
  }
}
