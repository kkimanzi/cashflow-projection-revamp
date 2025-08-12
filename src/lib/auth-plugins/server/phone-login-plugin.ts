import { user } from "@/db/schema";
import {
  type BetterAuthPlugin,
  createAuthMiddleware,
} from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../../db";

export const phoneLoginPlugin = () => {
  return {
    id: "phone-login-plugin",
    hooks: {
      before: [
        {
          matcher: (context) => {
            return ["/phone-number/send-otp"].includes(context.path);
          },
          handler: createAuthMiddleware(async (ctx) => {
            try {
              const requestBody = await ctx.body;
              const phoneNumber = requestBody?.phoneNumber;

              if (!phoneNumber) {
                return NextResponse.json({ status: 400 });
              }

              // Check if user exists in database
              const [existingUser] = await db
                .select()
                .from(user)
                .where(eq(user.phoneNumber, phoneNumber))
                .limit(1);

              if (!existingUser) {
                return NextResponse.json({ status: 403 });
              }

              return;
            } catch (error) {
              console.error("Phone login plugin error:", error);
              return NextResponse.json(
                { error: "Internal server error" },
                { status: 500 },
              );
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};
