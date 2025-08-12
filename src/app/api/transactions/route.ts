import {
  createTransactionSchema,
  ledgerQuerySchema,
} from "@/db/dto/transaction";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { type AppScope, hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new TransactionRepository();

/**
 * GET /api/transactions
 * Fetches ledger data including latest reconciliation and transactions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    const requiredScopes: AppScope[] = [
      "transaction:read",
      "transaction:read:own",
    ];
    const isAuthorized = requiredScopes.some((scope) =>
      hasScope(session.member.scopes, scope),
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedQueryParams = ledgerQuerySchema.parse({
      organizationId: session.session.activeOrganizationId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      projectionDays: queryParams.projectionDays
        ? Number.parseInt(queryParams.projectionDays)
        : 30,
      scopes: session.member.scopes, // Pass the member's scopes
    });

    const ledgerData = await repository.getLedgerData({
      ...validatedQueryParams,
      organizationId: session.session.activeOrganizationId,
      userId: session.user.id,
      scopes: session.member.scopes, // Ensure scopes are passed
    });

    return NextResponse.json(ledgerData);
  } catch (error) {
    console.error("Error fetching ledger data:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/transactions
 * Creates a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction:create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the input data
    const validatedData = createTransactionSchema.parse(body);

    const transaction = await repository.create(
      session.session.activeOrganizationId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
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
