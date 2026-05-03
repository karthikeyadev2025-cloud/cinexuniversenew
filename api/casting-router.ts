import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const castingRouter = createRouter({
  /* ─── Casting Directors ─── */
  directorList: publicQuery.query(async () => {
    return getDb().query.castingDirectors.findMany({
      with: { user: true },
      orderBy: [desc(schema.castingDirectors.createdAt)],
    });
  }),

  directorByUserId: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.castingDirectors.findFirst({
        where: eq(schema.castingDirectors.userId, input.userId),
        with: { user: true, talent: true },
      });
    }),

  directorCreate: authedQuery
    .input(
      z.object({
        agencyName: z.string().min(1),
        agencyLogo: z.string().optional(),
        licenseNumber: z.string().optional(),
        establishedYear: z.number().optional(),
        specialization: z.array(z.string()).optional(),
        portfolioUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const existing = await getDb().query.castingDirectors.findFirst({
        where: eq(schema.castingDirectors.userId, userId),
      });
      if (existing) {
        await getDb()
          .update(schema.castingDirectors)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(schema.castingDirectors.id, existing.id));
        return { id: existing.id, updated: true };
      }
      const [{ id }] = await getDb()
        .insert(schema.castingDirectors)
        .values({ ...input, userId })
        .returning({ id: schema.castingDirectors.id });
      return { id, updated: false };
    }),

  directorApprove: adminQuery
    .input(z.object({ id: z.number(), approvedBy: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.castingDirectors)
        .set({
          status: "approved",
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.castingDirectors.id, input.id));
      return { success: true };
    }),

  directorReject: adminQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.castingDirectors)
        .set({
          status: "rejected",
          rejectionReason: input.reason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.castingDirectors.id, input.id));
      return { success: true };
    }),

  /* ─── Talent Profiles ─── */
  talentList: publicQuery.query(async () => {
    return getDb().query.talentProfiles.findMany({
      with: { user: true, addedByDirector: true },
      orderBy: [desc(schema.talentProfiles.createdAt)],
    });
  }),

  talentByUserId: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.talentProfiles.findFirst({
        where: eq(schema.talentProfiles.userId, input.userId),
        with: { user: true, addedByDirector: true },
      });
    }),

  talentByDirector: publicQuery
    .input(z.object({ directorId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.talentProfiles.findMany({
        where: eq(schema.talentProfiles.addedByDirectorId, input.directorId),
        with: { user: true },
      });
    }),

  talentCreate: authedQuery
    .input(
      z.object({
        stageName: z.string().optional(),
        realName: z.string().optional(),
        dateOfBirth: z.string().datetime().optional(),
        gender: z.string().optional(),
        heightCm: z.number().optional(),
        weightKg: z.number().optional(),
        bodyType: z.string().optional(),
        complexion: z.string().optional(),
        hairColor: z.string().optional(),
        eyeColor: z.string().optional(),
        languages: z.array(z.string()).optional(),
        skills: z.array(z.string()).optional(),
        education: z.string().optional(),
        experience: z.string().optional(),
        awards: z.array(z.string()).optional(),
        portfolioVideoUrl: z.string().optional(),
        voiceSampleUrl: z.string().optional(),
        headshotUrl: z.string().optional(),
        fullBodyUrl: z.string().optional(),
        addedByDirectorId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const existing = await getDb().query.talentProfiles.findFirst({
        where: eq(schema.talentProfiles.userId, userId),
      });
      const data = {
        ...input,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        userId,
      };
      if (existing) {
        await getDb()
          .update(schema.talentProfiles)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.talentProfiles.id, existing.id));
        return { id: existing.id, updated: true };
      }
      const [{ id }] = await getDb()
        .insert(schema.talentProfiles)
        .values(data)
        .returning({ id: schema.talentProfiles.id });
      return { id, updated: false };
    }),

  talentApprove: adminQuery
    .input(z.object({ id: z.number(), approvedBy: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.talentProfiles)
        .set({
          status: "approved",
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.talentProfiles.id, input.id));
      return { success: true };
    }),

  talentReject: adminQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.talentProfiles)
        .set({
          status: "rejected",
          rejectionReason: input.reason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.talentProfiles.id, input.id));
      return { success: true };
    }),

  /* ─── Casting Calls ─── */
  callList: publicQuery.query(async () => {
    return getDb().query.castingCalls.findMany({
      with: { project: true, creator: true },
      orderBy: [desc(schema.castingCalls.createdAt)],
    });
  }),

  callById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.castingCalls.findFirst({
        where: eq(schema.castingCalls.id, input.id),
        with: { project: true, creator: true, submissions: { with: { talent: true } } },
      });
    }),

  callCreate: authedQuery
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1),
        roleName: z.string().min(1),
        roleDescription: z.string().optional(),
        gender: z.string().optional(),
        ageMin: z.number().optional(),
        ageMax: z.number().optional(),
        heightMinCm: z.number().optional(),
        heightMaxCm: z.number().optional(),
        language: z.string().optional(),
        location: z.string().optional(),
        remuneration: z.string().optional(),
        shootingDates: z.string().optional(),
        auditionType: z.string().optional(),
        auditionLocation: z.string().optional(),
        auditionDeadline: z.string().datetime().optional(),
        requiredSkills: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [{ id }] = await getDb()
        .insert(schema.castingCalls)
        .values({
          ...input,
          auditionDeadline: input.auditionDeadline ? new Date(input.auditionDeadline) : undefined,
          createdBy: ctx.user.id,
        })
        .returning({ id: schema.castingCalls.id });
      return { id };
    }),

  callUpdate: authedQuery
    .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.castingCalls)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(schema.castingCalls.id, input.id));
      return { success: true };
    }),

  callDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.castingCalls)
        .where(eq(schema.castingCalls.id, input.id));
      return { success: true };
    }),

  /* ─── Submissions ─── */
  submissionList: publicQuery.query(async () => {
    return getDb().query.submissions.findMany({
      with: { call: true, talent: { with: { user: true } }, director: true },
      orderBy: [desc(schema.submissions.createdAt)],
    });
  }),

  submissionByTalent: publicQuery
    .input(z.object({ talentId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.submissions.findMany({
        where: eq(schema.submissions.talentId, input.talentId),
        with: { call: { with: { project: true } } },
        orderBy: [desc(schema.submissions.createdAt)],
      });
    }),

  submissionCreate: authedQuery
    .input(
      z.object({
        callId: z.number(),
        talentId: z.number(),
        directorId: z.number().optional(),
        message: z.string().optional(),
        mediaUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb()
        .insert(schema.submissions)
        .values(input)
        .returning({ id: schema.submissions.id });
      return { id };
    }),

  submissionUpdateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewed", "shortlisted", "rejected", "booked"]),
        notes: z.string().optional(),
        reviewedBy: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.submissions)
        .set({
          status: input.status,
          notes: input.notes ?? null,
          reviewedBy: input.reviewedBy,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.submissions.id, input.id));
      return { success: true };
    }),
});
;
