import { z } from "zod";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { createRouter, publicQuery } from "./middleware";
import { getDb, isDbAvailable } from "./queries/connection";
import * as schema from "@db/schema";
import { signLocalToken, verifyLocalToken } from "./lib/local-jwt";
import { TRPCError } from "@trpc/server";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["user", "casting", "talent", "admin"]).default("user"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (!isDbAvailable()) {
          throw new TRPCError({
            code: "SERVICE_UNAVAILABLE",
            message: "Database is not configured. Please contact support.",
          });
        }

        const db = getDb();
        const existing = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, input.email))
          .then((rows) => rows.at(0));

        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }

        const passwordHash = await bcryptjs.hash(input.password, 10);
        const unionId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Set trial end date (14 days from now)
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        const [{ id }] = await db
          .insert(schema.users)
          .values({
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
            unionId,
            subscriptionStatus: "trial",
            trialEndsAt,
            planSlug: "pro", // Trial gets Pro features
          })
          .returning({ id: schema.users.id });

        // Create subscription record
        await db.insert(schema.subscriptions).values({
          userId: id,
          planSlug: "pro",
          status: "trial",
          trialEndsAt,
        });

        const token = await signLocalToken({ userId: id, email: input.email, role: input.role });

        return {
          token,
          user: { id, name: input.name, email: input.email, role: input.role },
        };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        console.error("Registration error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed. Please try again.",
        });
      }
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (!isDbAvailable()) {
          throw new TRPCError({
            code: "SERVICE_UNAVAILABLE",
            message: "Database is not configured. Please contact support.",
          });
        }

        const db = getDb();
        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, input.email))
          .then((rows) => rows.at(0));

        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const valid = await bcryptjs.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const token = await signLocalToken({
          userId: user.id,
          email: user.email!,
          role: user.role,
        });

        await db
          .update(schema.users)
          .set({ lastSignInAt: new Date() })
          .where(eq(schema.users.id, user.id));

        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        console.error("Login error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed. Please try again.",
        });
      }
    }),

  me: publicQuery.query(async ({ ctx }) => {
    try {
      const authHeader = ctx.req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return null;
      }
      const token = authHeader.slice(7);
      const payload = await verifyLocalToken(token);
      if (!payload) return null;

      if (!isDbAvailable()) {
        return null;
      }

      const user = await getDb()
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.userId))
        .then((rows) => rows.at(0));

      if (!user || !user.isActive) return null;
      return user;
    } catch {
      return null;
    }
  }),
});
