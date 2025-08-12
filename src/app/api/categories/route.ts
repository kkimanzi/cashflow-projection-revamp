// app/api/category/route.ts
import {
  createTransactionCategorySchema,
  transactionCategoryQuerySchema,
} from "@/db/dto/transaction-category";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CategoryRepository } from "../../../db/repositories/category.repository";

const repository = new CategoryRepository();

/**
 * GET /api/category
 * Fetches all transaction categories for the authenticated organization.
 * Supports optional filtering by type and inclusion of system categories.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction_category:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedQueryParams = transactionCategoryQuerySchema.parse({
      organizationId: session.session.activeOrganizationId,
      type: queryParams.type,
      includeSystem: queryParams.includeSystem === "true", // Convert string to boolean
    });

    const categories = await repository.getAll(
      validatedQueryParams.organizationId,
      validatedQueryParams.type,
      validatedQueryParams.includeSystem,
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
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
 * POST /api/category
 * Creates a new transaction category for the authenticated organization.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction_category:create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Validate the input data for creating a new category
    const validatedData = createTransactionCategorySchema.parse(body);

    const category = await repository.create(
      session.session.activeOrganizationId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
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

/**
 * PUT /api/category/precedence
 * Updates the display priority for multiple transaction categories.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    // Validate the input data for bulk precedence update
    const validatedUpdates = z
      .array(
        z.object({
          categoryId: z.string(),
          displayPriority: z.number().int().nullable(),
        }),
      )
      .parse(body);

    await repository.updateManyPrecedence(
      session.session.activeOrganizationId,
      validatedUpdates,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category precedence:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data for precedence update",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
