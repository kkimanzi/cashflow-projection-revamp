// api/recurring-transactions/[id]/route.ts
import { updateRecurringTransactionTemplateSchema } from "@/db/dto/recurring-transactions-template";
import { RecurringTransactionTemplateRepository } from "@/db/repositories/recurring-transactions-template.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new RecurringTransactionTemplateRepository();

/**
 * GET /api/recurring-transactions/[id]
 * Fetches a specific recurring transaction template by ID
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "recurring_transaction:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await repository.getById(
      session.session.activeOrganizationId,
      params.id,
    );

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching recurring transaction template:", error);
    if (
      error instanceof Error &&
      error.message === "Recurring transaction template not found"
    ) {
      return NextResponse.json(
        { error: "Recurring transaction template not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/recurring-transactions/[id]
 * Updates a specific recurring transaction template
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "recurring_transaction:update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the input data
    const validatedData = updateRecurringTransactionTemplateSchema.parse(body);

    const template = await repository.update(
      session.session.activeOrganizationId,
      params.id,
      validatedData,
    );

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating recurring transaction template:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "Recurring transaction template not found"
    ) {
      return NextResponse.json(
        { error: "Recurring transaction template not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/recurring-transactions/[id]
 * Deletes a specific recurring transaction template
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "recurring_transaction:delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await repository.delete(session.session.activeOrganizationId, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring transaction template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
