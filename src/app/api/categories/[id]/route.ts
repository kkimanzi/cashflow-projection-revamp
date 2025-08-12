// app/api/category/[id]/route.ts
import { updateTransactionCategorySchema } from "@/db/dto/transaction-category";
import { CategoryRepository } from "@/db/repositories/category.repository"; // Adjust path if needed
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new CategoryRepository();

/**
 * PUT /api/category/[id]
 * Updates a specific transaction category.
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction_category:update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTransactionCategorySchema.parse(body);

    const category = await repository.update(
      params.id,
      session.session.activeOrganizationId,
      validatedData,
    );
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/category/[id]
 * Deletes a specific transaction category.
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "transaction_category:delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await repository.delete(
      params.id,
      session.session.activeOrganizationId,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error instanceof Error) {
      if (error.message === "Category not found or cannot be deleted") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
