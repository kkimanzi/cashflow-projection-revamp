import { member } from "@/db/schema";
import { and, eq } from "drizzle-orm";
// lib/api/protected-route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";
import { db } from "../db";

export async function protectedRoute(request: NextRequest) {
  const session = await auth.api.getSession(request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.session?.activeOrganizationId) {
    return NextResponse.json(
      { error: "No active organization" },
      { status: 400 },
    );
  }

  const [dbRequestingMember] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, session.session.activeOrganizationId),
      ),
    )
    .limit(1);

  if (!dbRequestingMember) {
    return NextResponse.json(
      { error: "Member info not found" },
      { status: 400 },
    );
  }
  return { ...session, member: dbRequestingMember };
}
