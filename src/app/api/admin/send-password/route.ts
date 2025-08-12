import { auth } from "@/lib/auth";
import { sendPasswordEmail } from "@/lib/services/send-password-email";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  // 1. Verify the request is from an admin/owner
  if (!session?.session) {
    return new NextResponse(
      JSON.stringify({ error: "User is not authenticated" }),
      { status: 401 },
    );
  }

  if (!["admin", "owner"].includes(session.user.role || "")) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized access: User does not have admin privileges.",
      }),
      {
        status: 403,
      },
    );
  }

  try {
    const { email, name, password } = await request.json();

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: "Email and password are required." }),
        { status: 400 },
      );
    }

    // 2. Call the utility function to send the password email
    await sendPasswordEmail({ email, name, password });

    return NextResponse.json(
      { message: "Password email sent successfully." },
      { status: 200 },
    );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    console.error("Error in /api/admin/send-password:", error);
    return new NextResponse(
      JSON.stringify({
        error: error.message || "Failed to send password email.",
      }),
      {
        status: 500,
      },
    );
  }
}
