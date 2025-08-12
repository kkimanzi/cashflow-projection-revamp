// app/api/projected-overrides/route.ts

import { ProjectedRecurringTransactionOverrideRepository } from "@/db/repositories/projectedRecurringTransactionOverride.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";

const repository = new ProjectedRecurringTransactionOverrideRepository();

export async function POST(request: NextRequest) {
  const session = await protectedRoute(request);
  if (session instanceof NextResponse) return session;

  if (!hasScope(session.member.scopes, "projection:update")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = {
      ...body,
      organizationId: session.session.activeOrganizationId,
      recurringTemplateId: body.recurringTemplateId,
      date: body.date,
    };

    const override = await repository.create(
      session.session.activeOrganizationId,
      session.user.id,
      payload,
    );
    return NextResponse.json({ override }, { status: 201 });
  } catch (error) {
    console.error("Error creating projection override:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create override",
      },
      { status: 400 },
    );
  }
}
