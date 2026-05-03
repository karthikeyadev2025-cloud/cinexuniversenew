import { z } from "zod";
import { eq, desc, sql, asc } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const adminRouter = createRouter({
  /* ─── Dashboard Stats ─── */
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
    const [talentCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.talentProfiles);
    const [directorCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.castingDirectors);
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.projects);
    const [callCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.castingCalls);
    const [submissionCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.submissions);
    const [pendingTalent] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.talentProfiles)
      .where(eq(schema.talentProfiles.status, "pending"));
    const [pendingDirectors] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.castingDirectors)
      .where(eq(schema.castingDirectors.status, "pending"));

    return {
      users: userCount?.count ?? 0,
      talent: talentCount?.count ?? 0,
      directors: directorCount?.count ?? 0,
      projects: projectCount?.count ?? 0,
      calls: callCount?.count ?? 0,
      submissions: submissionCount?.count ?? 0,
      pendingTalent: pendingTalent?.count ?? 0,
      pendingDirectors: pendingDirectors?.count ?? 0,
    };
  }),

  /* ─── Users ─── */
  userList: adminQuery.query(async () => {
    return getDb().query.users.findMany({
      with: { profile: true, castingDirector: true, talentProfile: true },
      orderBy: [desc(schema.users.createdAt)],
    });
  }),

  userUpdateRole: adminQuery
    .input(z.object({ id: z.number(), role: z.enum(["user", "admin", "casting", "talent"]) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(schema.users.id, input.id));
      return { success: true };
    }),

  userDeactivate: adminQuery
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.users)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(eq(schema.users.id, input.id));
      return { success: true };
    }),

  /* ─── Feature Toggles ─── */
  featureList: adminQuery.query(async () => {
    return getDb().select().from(schema.featureToggles).orderBy(asc(schema.featureToggles.category));
  }),

  featureUpdate: adminQuery
    .input(z.object({ id: z.number(), enabled: z.boolean(), metadata: z.record(z.string(), z.any()).optional() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.featureToggles)
        .set({
          enabled: input.enabled,
          metadata: input.metadata ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(schema.featureToggles.id, input.id));
      return { success: true };
    }),

  /* ─── Plans ─── */
  planList: adminQuery.query(async () => {
    return getDb().select().from(schema.plans).orderBy(schema.plans.sortOrder);
  }),

  planUpsert: adminQuery
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        monthlyPrice: z.number().optional(),
        yearlyPrice: z.number().optional(),
        features: z.array(z.string()).optional(),
        isPopular: z.boolean().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (id) {
        await getDb()
          .update(schema.plans)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.plans.id, id));
        return { id, updated: true };
      }
      const [{ id: newId }] = await getDb()
        .insert(schema.plans)
        .values(data as schema.InsertPlan)
        .returning({ id: schema.plans.id });
      return { id: newId, updated: false };
    }),

  /* ─── API Configs ─── */
  apiConfigList: adminQuery.query(async () => {
    return getDb().select().from(schema.apiConfigs).orderBy(desc(schema.apiConfigs.updatedAt));
  }),

  apiConfigUpsert: adminQuery
    .input(
      z.object({
        id: z.number().optional(),
        provider: z.string().min(1),
        keyName: z.string().min(1),
        keyValue: z.string().min(1),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (id) {
        await getDb()
          .update(schema.apiConfigs)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.apiConfigs.id, id));
        return { id, updated: true };
      }
      const [{ id: newId }] = await getDb()
        .insert(schema.apiConfigs)
        .values(data as schema.InsertApiConfig)
        .returning({ id: schema.apiConfigs.id });
      return { id: newId, updated: false };
    }),

  /* ─── Audit Logs ─── */
  auditList: adminQuery
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      return getDb()
        .select()
        .from(schema.auditLogs)
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(limit)
        .offset(offset);
    }),

  auditCreate: adminQuery
    .input(
      z.object({
        action: z.string().min(1),
        entityType: z.string().min(1),
        entityId: z.number().optional(),
        details: z.record(z.string(), z.any()).optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [{ id }] = await getDb()
        .insert(schema.auditLogs)
        .values({
          ...input,
          userId: ctx.user.id,
          details: input.details ?? null,
        })
        .returning({ id: schema.auditLogs.id });
      return { id };
    }),
});
