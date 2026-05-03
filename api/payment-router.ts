import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb, isDbAvailable } from "./queries/connection";
import * as schema from "@db/schema";
import { TRPCError } from "@trpc/server";
import { env } from "./lib/env";

export const paymentRouter = createRouter({
  // Get Razorpay Key ID for frontend
  getKey: publicQuery.query(() => {
    return { keyId: env.razorpayKeyId || "" };
  }),

  // Create order
  createOrder: authedQuery
    .input(
      z.object({
        planSlug: z.enum(["pro", "studio"]),
        billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!env.razorpayKeyId || !env.razorpayKeySecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Razorpay not configured. Please contact support.",
        });
      }

      if (!isDbAvailable()) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database is not configured. Please contact support.",
        });
      }

      const db = getDb();
      const plan = await db
        .select()
        .from(schema.plans)
        .where(eq(schema.plans.slug, input.planSlug))
        .then((rows) => rows.at(0));

      if (!plan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
      }

      const amount = input.billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
      if (!amount || amount <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan price" });
      }

      // Create Razorpay order via API
      const resp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${env.razorpayKeyId}:${env.razorpayKeySecret}`)}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // paise
          currency: "INR",
          receipt: `cinex_${ctx.user.id}_${Date.now()}`,
          notes: {
            userId: String(ctx.user.id),
            planSlug: input.planSlug,
            billingCycle: input.billingCycle,
          },
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Razorpay error: ${text}` });
      }

      const order = (await resp.json()) as { id: string; amount: number; currency: string };

      // Record payment in DB
      await db.insert(schema.payments).values({
        userId: ctx.user.id,
        razorpayOrderId: order.id,
        amount,
        currency: "INR",
        planSlug: input.planSlug,
        billingCycle: input.billingCycle,
        status: "created",
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.razorpayKeyId,
      };
    }),

  // Verify payment
  verifyPayment: authedQuery
    .input(
      z.object({
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!env.razorpayKeySecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Razorpay secret not configured",
        });
      }

      // Verify signature using Node crypto
      const crypto = await import("crypto");
      const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", env.razorpayKeySecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== input.razorpaySignature) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid payment signature" });
      }

      if (!isDbAvailable()) {
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database not configured" });
      }

      const db = getDb();

      // Update payment status
      await db
        .update(schema.payments)
        .set({
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          status: "captured",
          updatedAt: new Date(),
        })
        .where(eq(schema.payments.razorpayOrderId, input.razorpayOrderId));

      // Get payment details
      const payment = await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.razorpayOrderId, input.razorpayOrderId))
        .then((rows) => rows.at(0));

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment record not found" });
      }

      // Activate subscription
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (payment.billingCycle === "yearly" ? 12 : 1));

      await db
        .insert(schema.subscriptions)
        .values({
          userId: ctx.user.id,
          planSlug: payment.planSlug,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.userId,
          set: {
            planSlug: payment.planSlug,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          },
        });

      // Update user plan
      await db
        .update(schema.users)
        .set({
          planSlug: payment.planSlug,
          subscriptionStatus: "active",
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, ctx.user.id));

      return { success: true, planSlug: payment.planSlug };
    }),

  // Get current subscription
  getSubscription: authedQuery.query(async ({ ctx }) => {
    if (!isDbAvailable()) {
      return { status: "trial", planSlug: "free", trialEndsAt: null };
    }

    const db = getDb();
    const sub = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, ctx.user.id))
      .then((rows) => rows.at(0));

    if (!sub) {
      // Check user record for trial info
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, ctx.user.id))
        .then((rows) => rows.at(0));

      if (user?.subscriptionStatus === "trial" && user.trialEndsAt) {
        if (new Date() > user.trialEndsAt) {
          return { status: "expired", planSlug: user.planSlug || "free", trialEndsAt: user.trialEndsAt };
        }
        return { status: "trial", planSlug: user.planSlug || "pro", trialEndsAt: user.trialEndsAt };
      }

      return { status: "trial", planSlug: "free", trialEndsAt: null };
    }

    // Check if trial expired
    if (sub.status === "trial" && sub.trialEndsAt && new Date() > sub.trialEndsAt) {
      await db
        .update(schema.subscriptions)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(schema.subscriptions.userId, ctx.user.id));

      await db
        .update(schema.users)
        .set({ subscriptionStatus: "expired", updatedAt: new Date() })
        .where(eq(schema.users.id, ctx.user.id));

      return { status: "expired", planSlug: sub.planSlug, trialEndsAt: sub.trialEndsAt };
    }

    return {
      status: sub.status,
      planSlug: sub.planSlug,
      trialEndsAt: sub.trialEndsAt,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }),

  // Get all plans
  getPlans: publicQuery.query(async () => {
    if (!isDbAvailable()) {
      return [
        { name: "Free", slug: "free", description: "Basic access", monthlyPrice: 0, yearlyPrice: 0, features: ["1 Project"], isPopular: false },
        { name: "Pro", slug: "pro", description: "Full suite", monthlyPrice: 1999, yearlyPrice: 19999, features: ["Unlimited Projects", "AI Tools"], isPopular: true },
        { name: "Studio", slug: "studio", description: "Enterprise", monthlyPrice: 4999, yearlyPrice: 49999, features: ["Team", "API"], isPopular: false },
      ];
    }
    const db = getDb();
    return db.select().from(schema.plans).where(eq(schema.plans.isActive, true)).orderBy(schema.plans.sortOrder);
  }),
});
