// app/api/projection-settings/route.ts
import { projectionSettingsInputSchema } from "@/db/dto/projection-settings";
import { ProjectionSettingsRepository } from "@/db/repositories/projection-settings.repository";
import { protectedRoute } from "@/lib/api/protected-route";
import { hasScope } from "@/lib/scopes/scopes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repository = new ProjectionSettingsRepository();

/**
 * GET /api/projection-settings
 * Fetches the projection settings for the authenticated organization.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (!hasScope(session.member.scopes, "projection_settings:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await repository.get(session.session.activeOrganizationId);

    if (!settings) {
      // If no settings exist, return a default/empty state or 404
      return NextResponse.json(
        { message: "Projection settings not found for this organization." },
        { status: 404 },
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching projection settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/projection-settings
 * Creates or updates the projection settings for the authenticated organization.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await protectedRoute(request);
    if (session instanceof NextResponse) return session;

    if (
      !hasScope(session.member.scopes, "projection_settings:update") ||
      !hasScope(session.member.scopes, "projection_settings:create")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = projectionSettingsInputSchema.parse(body);

    const settings = await repository.upsert(
      session.session.activeOrganizationId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating projection settings:", error);
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
