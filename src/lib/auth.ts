import { member as schemaMember, user } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, organization as organizationPlugin } from "better-auth/plugins";
import { openAPI } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import { memberScopesPlugin } from "./auth-plugins/server/member-plugin";
import { db } from "./db";
import { sendInvitationEmail } from "./services/send-invite-email";
import { sendPasswordResetEmail } from "./services/send-password-reset-email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      isPayingCustomer: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  plugins: [
    organizationPlugin({
      schema: {
        member: {
          additionalFields: {
            scopes: {
              type: "string",
              defaultValue: "",
              input: false,
              required: false,
            },
          },
        },
      },
      allowUserToCreateOrganization: async (ctxUser) => {
        const dbUser = await db.query.user.findFirst({
          where: eq(user.id, ctxUser.id),
        });
        if (!dbUser) {
          return false;
        }
        return Boolean(dbUser.isPayingCustomer);
      },
      async sendInvitationEmail(data) {
        await sendInvitationEmail(data);
      },
      organizationCreation: {
        beforeCreate: async ({ organization, user }, request) => {
          if (organization.slug.toLowerCase() === "admin") {
            throw new APIError("BAD_REQUEST", {
              message: "Slug is already taken",
            });
          }
        },
        afterCreate: async ({ organization, member, user }, request) => {
          try {
            // Update the member record to give owner full permissions
            await db
              .update(schemaMember)
              .set({ scopes: "*:*" })
              .where(
                and(
                  eq(schemaMember.userId, user.id),
                  eq(schemaMember.organizationId, organization.id),
                ),
              );
          } catch (error) {
            console.error("Failed to update member scopes:", error);
          }
        },
      },
    }),
    memberScopesPlugin(),
    nextCookies(),
    openAPI(),
    admin({
      adminRoles: ["admin", "owner"],
    }),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const activeOrganization = await getActiveOrganizationId(
            session.userId,
          );
          return {
            data: {
              ...session,
              activeOrganizationId: activeOrganization ?? null,
            },
          };
        },
      },
    },
  },
});

async function getActiveOrganizationId(userId: string) {
  const data = await db.query.member.findFirst({
    where: (member, { eq }) => eq(member.userId, userId),
    columns: {
      id: true,
      organizationId: true,
    },
  });

  return data?.organizationId;
}
