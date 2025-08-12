import { createReconciliationSchema } from "@/db/dto/reconciliation/create";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new TransactionRepository();

/**
 * GET /api/reconciliations
 * Fetches reconciliations for the authenticated organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "reconciliation:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? // biome-ignore lint/style/noNonNullAssertion: <explanation> TODO: Fix this
        Number.parseInt(searchParams.get("limit")!)
      : 10;

    const reconciliations = await repository.getAllReconciliations(
      session.session.activeOrganizationId,
      Math.min(limit, 100), // Cap at 100
    );

    return NextResponse.json({ reconciliations });
  } catch (error) {
    console.error("Error fetching reconciliations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reconciliations
 * Creates a new reconciliation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "reconciliation:create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the input data
    const validatedData = createReconciliationSchema.parse(body);

    const reconciliation = await repository.createReconciliation(
      session.session.activeOrganizationId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json({ reconciliation }, { status: 201 });
  } catch (error) {
    console.error("Error creating reconciliation:", error);
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
