import { ProjectedRecurringTransactionOverrideRepository } from "@/db/repositories/projectedRecurringTransactionOverride.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";

const repository = new ProjectedRecurringTransactionOverrideRepository();

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await protectedRoute(request);
  if (session instanceof NextResponse) return session;

  if (!hasScope(session.member.scopes, "projection:update")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const override = await repository.update(
      params.id,
      session.session.activeOrganizationId,
      body,
    );
    return NextResponse.json({ override });
  } catch (error) {
    console.error("Error updating projection override:", error);
    return NextResponse.json(
      { error: "Failed to update projection override" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await protectedRoute(request);
  if (session instanceof NextResponse) return session;

  if (!hasScope(session.member.scopes, "projection:update")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await repository.delete(params.id, session.session.activeOrganizationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting projection override:", error);
    return NextResponse.json(
      { error: "Failed to delete projection override" },
      { status: 400 },
    );
  }
}
