import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb, isDbAvailable } from "./queries/connection";
import * as schema from "@db/schema";
import { signLocalToken } from "./lib/local-jwt";
import { TRPCError } from "@trpc/server";
import { env } from "./lib/env";

export const googleAuthRouter = createRouter({
  getAuthUrl: publicQuery.query(() => {
    if (!env.googleClientId) {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Google OAuth is not configured. Please use email/password login.",
      });
    }

    const redirectUri = `${env.appUrl}/api/oauth/google/callback`;
    const scope = encodeURIComponent("openid email profile");
    const state = Buffer.from(JSON.stringify({ provider: "google", ts: Date.now() })).toString("base64");

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=consent`;

    return { url };
  }),

  // Exchange code for token (called by callback handler)
  exchangeCode: publicQuery
    .input(z.object({ code: z.string(), state: z.string() }))
    .mutation(async ({ input }) => {
      if (!env.googleClientId || !env.googleClientSecret) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Google OAuth is not configured",
        });
      }

      const redirectUri = `${env.appUrl}/api/oauth/google/callback`;

      // Exchange code for access token
      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: input.code,
          client_id: env.googleClientId,
          client_secret: env.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResp.ok) {
        const err = await tokenResp.text();
        throw new TRPCError({ code: "UNAUTHORIZED", message: `Google token exchange failed: ${err}` });
      }

      const tokenData = (await tokenResp.json()) as { access_token: string; id_token?: string };

      // Get user info from Google
      const userResp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userResp.ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to fetch Google user info" });
      }

      const googleUser = (await userResp.json()) as { id: string; email: string; name: string; picture?: string };

      if (!isDbAvailable()) {
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database not configured" });
      }

      const db = getDb();

      // Check if user exists
      let user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, googleUser.email))
        .then((rows) => rows.at(0));

      if (!user) {
        // Create new user
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        const [{ id }] = await db
          .insert(schema.users)
          .values({
            name: googleUser.name,
            email: googleUser.email,
            unionId: `google-${googleUser.id}`,
            avatar: googleUser.picture,
            role: "user",
            subscriptionStatus: "trial",
            trialEndsAt,
            planSlug: "pro",
          })
          .returning({ id: schema.users.id });

        await db.insert(schema.subscriptions).values({
          userId: id,
          planSlug: "pro",
          status: "trial",
          trialEndsAt,
        });

        user = await db.select().from(schema.users).where(eq(schema.users.id, id)).then((rows) => rows.at(0));
      } else {
        // Update last sign in
        await db
          .update(schema.users)
          .set({ lastSignInAt: new Date(), name: googleUser.name || user.name, avatar: googleUser.picture || user.avatar })
          .where(eq(schema.users.id, user.id));
      }

      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User creation failed" });
      }

      const token = await signLocalToken({
        userId: user.id,
        email: user.email!,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    }),
});
