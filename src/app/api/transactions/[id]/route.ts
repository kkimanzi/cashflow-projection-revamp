import { updateTransactionSchema } from "@/db/dto/transaction";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new TransactionRepository();

/**
 * GET /api/transactions/[id]
 * Fetches a specific transaction by ID
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await repository.getById(
      session.session.activeOrganizationId,
      params.id,
    );

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
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
 * PUT /api/transactions/[id]
 * Updates a specific transaction
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction:update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the input data
    const validatedData = updateTransactionSchema.parse(body);

    const transaction = await repository.update(
      session.session.activeOrganizationId,
      params.id,
      validatedData,
    );

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
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
 * DELETE /api/transactions/[id]
 * Deletes a specific transaction
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction:delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await repository.delete(session.session.activeOrganizationId, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
