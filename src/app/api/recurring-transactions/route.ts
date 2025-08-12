// api/recurring-transactions/route.ts
import { createRecurringTransactionTemplateSchema } from "@/db/dto/recurring-transactions-template";
import { RecurringTransactionTemplateRepository } from "@/db/repositories/recurring-transactions-template.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new RecurringTransactionTemplateRepository();

/**
 * GET /api/recurring-transactions
 * Fetches all recurring transaction templates for the authenticated organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "recurring_transaction:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await repository.getAll(
      session.session.activeOrganizationId,
    );

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching recurring transaction templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/recurring-transactions
 * Creates a new recurring transaction template
 */
export async function POST(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "recurring_transaction:create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the input data
    const validatedData = createRecurringTransactionTemplateSchema.parse(body);

    const template = await repository.create(
      session.session.activeOrganizationId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring transaction template:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
