import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const projectRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().query.projects.findMany({
      with: { owner: true, calls: true },
      orderBy: [desc(schema.projects.createdAt)],
    });
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.projects.findFirst({
        where: eq(schema.projects.id, input.id),
        with: { owner: true, calls: { with: { submissions: true } } },
      });
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getDb().query.projects.findFirst({
        where: eq(schema.projects.slug, input.slug),
        with: { owner: true, calls: true },
      });
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        genre: z.string().optional(),
        language: z.string().optional(),
        budgetRange: z.string().optional(),
        producerName: z.string().optional(),
        directorName: z.string().optional(),
        bannerImage: z.string().optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [{ id }] = await getDb()
        .insert(schema.projects)
        .values({ ...input, ownerId: ctx.user.id })
        .returning({ id: schema.projects.id });
      return { id };
    }),

  update: authedQuery
    .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.projects)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(schema.projects.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.projects)
        .where(eq(schema.projects.id, input.id));
      return { success: true };
    }),
});
