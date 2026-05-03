import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  castingDirectors,
  talentProfiles,
  projects,
  castingCalls,
  submissions,
  media,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  castingDirector: one(castingDirectors, {
    fields: [users.id],
    references: [castingDirectors.userId],
  }),
  talentProfile: one(talentProfiles, {
    fields: [users.id],
    references: [talentProfiles.userId],
  }),
  projects: many(projects),
  media: many(media),
}));

export const castingDirectorsRelations = relations(castingDirectors, ({ one, many }) => ({
  user: one(users, { fields: [castingDirectors.userId], references: [users.id] }),
  talent: many(talentProfiles),
}));

export const talentProfilesRelations = relations(talentProfiles, ({ one, many }) => ({
  user: one(users, { fields: [talentProfiles.userId], references: [users.id] }),
  addedByDirector: one(castingDirectors, {
    fields: [talentProfiles.addedByDirectorId],
    references: [castingDirectors.id],
  }),
  submissions: many(submissions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  calls: many(castingCalls),
}));

export const castingCallsRelations = relations(castingCalls, ({ one, many }) => ({
  project: one(projects, { fields: [castingCalls.projectId], references: [projects.id] }),
  creator: one(users, { fields: [castingCalls.createdBy], references: [users.id] }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  call: one(castingCalls, { fields: [submissions.callId], references: [castingCalls.id] }),
  talent: one(talentProfiles, { fields: [submissions.talentId], references: [talentProfiles.id] }),
  director: one(castingDirectors, {
    fields: [submissions.directorId],
    references: [castingDirectors.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  user: one(users, { fields: [media.userId], references: [users.id] }),
}));
