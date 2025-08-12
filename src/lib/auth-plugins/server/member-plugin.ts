import { member } from "@/db/schema";
import { filterValidScopes } from "@/lib/scopes/scopes";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../../db";

export const memberScopesPlugin = () => {
  return {
    id: "member-scopes-plugin",
    endpoints: {
      updateScopes: createAuthEndpoint(
        "/organization/update-member-scopes",
        {
          method: "POST",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          if (!session.session.activeOrganizationId) {
            throw new APIError("UNAUTHORIZED");
          }

          const sessionActiveOrgId = session.session
            .activeOrganizationId as string;
          const requestingUserId = session.user.id;

          // Check if requesting user is owner or admin of the organization
          const [dbRequestingMember] = await db
            .select()
            .from(member)
            .where(
              and(
                eq(member.userId, requestingUserId),
                eq(member.organizationId, sessionActiveOrgId),
              ),
            )
            .limit(1);

          if (
            !dbRequestingMember ||
            !["admin", "owner"].includes(dbRequestingMember.role)
          ) {
            throw new APIError("UNAUTHORIZED", {
              message:
                "Only organization owners or admins can update member scopes.",
            });
          }

          // Get fields from body
          const { memberId, scopes } = ctx.body as {
            memberId?: string;
            scopes?: string; // Changed from string[] to string
          };

          if (!memberId || typeof memberId !== "string") {
            throw new APIError("BAD_REQUEST", {
              message: "Missing or invalid 'memberId' in request body.",
            });
          }

          if (!scopes || typeof scopes !== "string") {
            throw new APIError("BAD_REQUEST", {
              message:
                "Missing or invalid 'scopes' (must be a string) in request body.",
            });
          }

          // Confirm that the member being updated is actually a member of the requesting user's active org
          const [dbMemberBeingUpdated] = await db
            .select()
            .from(member)
            .where(
              and(
                eq(member.id, memberId),
                eq(member.organizationId, sessionActiveOrgId),
              ),
            )
            .limit(1);

          if (!dbMemberBeingUpdated) {
            throw new APIError("NOT_FOUND", {
              message: "Member to be updated not found in this organization.",
            });
          }

          // Filter and validate scopes
          const filteredScopes = filterValidScopes(scopes);
          if (!filteredScopes && scopes.trim() !== "") {
            throw new APIError("BAD_REQUEST", {
              message: "No valid scopes provided",
            });
          }

          // Update member scopes
          const [updatedMember] = await db
            .update(member)
            .set({ scopes: filteredScopes })
            .where(
              and(
                eq(member.id, memberId),
                eq(member.organizationId, sessionActiveOrgId),
              ),
            )
            .returning();

          if (!updatedMember) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to update member scopes.",
            });
          }

          return NextResponse.json(
            { message: "Scopes updated successfully" },
            { status: 200 },
          );
        },
      ),
    },
  } satisfies BetterAuthPlugin;
};
