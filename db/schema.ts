import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/* ─── Enums ─── */
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "casting", "talent"]);
export const talentStatusEnum = pgEnum("talent_status", ["pending", "approved", "rejected"]);
export const directorStatusEnum = pgEnum("director_status", ["pending", "approved", "rejected"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "reviewed", "shortlisted", "rejected", "booked"]);
export const callStatusEnum = pgEnum("call_status", ["draft", "published", "closed", "filled"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "voice", "document"]);
export const projectStatusEnum = pgEnum("project_status", ["pre_production", "production", "post_production", "completed"]);

/* ─── Users (OAuth + local) ─── */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    unionId: varchar("union_id", { length: 255 }).unique(),
    email: varchar("email", { length: 320 }).unique(),
    name: varchar("name", { length: 255 }),
    avatar: text("avatar"),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }).defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    planSlug: varchar("plan_slug", { length: 50 }).default("free"),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    subscriptionStatus: varchar("subscription_status", { length: 50 }).default("trial"),
    razorpayCustomerId: varchar("razorpay_customer_id", { length: 255 }),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ─── Extended Profiles (filmmakers, talent, casting directors) ─── */
export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    phone: varchar("phone", { length: 50 }),
    whatsapp: varchar("whatsapp", { length: 50 }),
    bio: text("bio"),
    location: varchar("location", { length: 255 }),
    website: varchar("website", { length: 500 }),
    instagram: varchar("instagram", { length: 255 }),
    twitter: varchar("twitter", { length: 255 }),
    youtube: varchar("youtube", { length: 255 }),
    linkedin: varchar("linkedin", { length: 255 }),
    languages: jsonb("languages").$type<string[]>(),
    skills: jsonb("skills").$type<string[]>(),
    experience: text("experience"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("profiles_user_id_idx").on(table.userId),
  })
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/* ─── Casting Directors (Agencies) ─── */
export const castingDirectors = pgTable(
  "casting_directors",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    agencyName: varchar("agency_name", { length: 255 }).notNull(),
    agencyLogo: text("agency_logo"),
    licenseNumber: varchar("license_number", { length: 100 }),
    establishedYear: integer("established_year"),
    specialization: jsonb("specialization").$type<string[]>(),
    portfolioUrl: varchar("portfolio_url", { length: 500 }),
    status: directorStatusEnum("status").default("pending").notNull(),
    approvedBy: integer("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("cd_user_id_idx").on(table.userId),
    statusIdx: index("cd_status_idx").on(table.status),
  })
);

export type CastingDirector = typeof castingDirectors.$inferSelect;
export type InsertCastingDirector = typeof castingDirectors.$inferInsert;

/* ─── Talent Profiles (Actors/Actresses) ─── */
export const talentProfiles = pgTable(
  "talent_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    stageName: varchar("stage_name", { length: 255 }),
    realName: varchar("real_name", { length: 255 }),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    gender: varchar("gender", { length: 50 }),
    heightCm: integer("height_cm"),
    weightKg: integer("weight_kg"),
    bodyType: varchar("body_type", { length: 50 }),
    complexion: varchar("complexion", { length: 50 }),
    hairColor: varchar("hair_color", { length: 50 }),
    eyeColor: varchar("eye_color", { length: 50 }),
    languages: jsonb("languages").$type<string[]>(),
    skills: jsonb("skills").$type<string[]>(),
    education: text("education"),
    experience: text("experience"),
    awards: jsonb("awards").$type<string[]>(),
    portfolioVideoUrl: text("portfolio_video_url"),
    voiceSampleUrl: text("voice_sample_url"),
    headshotUrl: text("headshot_url"),
    fullBodyUrl: text("full_body_url"),
    status: talentStatusEnum("status").default("pending").notNull(),
    approvedBy: integer("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    addedByDirectorId: integer("added_by_director_id"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("talent_user_id_idx").on(table.userId),
    statusIdx: index("talent_status_idx").on(table.status),
    directorIdx: index("talent_director_idx").on(table.addedByDirectorId),
  })
);

export type TalentProfile = typeof talentProfiles.$inferSelect;
export type InsertTalentProfile = typeof talentProfiles.$inferInsert;

/* ─── Projects (Films) ─── */
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    genre: varchar("genre", { length: 100 }),
    language: varchar("language", { length: 100 }),
    status: projectStatusEnum("status").default("pre_production").notNull(),
    budgetRange: varchar("budget_range", { length: 100 }),
    producerName: varchar("producer_name", { length: 255 }),
    directorName: varchar("director_name", { length: 255 }),
    bannerImage: text("banner_image"),
    ownerId: integer("owner_id").notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("projects_owner_idx").on(table.ownerId),
    slugIdx: index("projects_slug_idx").on(table.slug),
    statusIdx: index("projects_status_idx").on(table.status),
  })
);

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/* ─── Casting Calls ─── */
export const castingCalls = pgTable(
  "casting_calls",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    roleName: varchar("role_name", { length: 255 }).notNull(),
    roleDescription: text("role_description"),
    gender: varchar("gender", { length: 50 }),
    ageMin: integer("age_min"),
    ageMax: integer("age_max"),
    heightMinCm: integer("height_min_cm"),
    heightMaxCm: integer("height_max_cm"),
    language: varchar("language", { length: 100 }),
    location: varchar("location", { length: 255 }),
    remuneration: varchar("remuneration", { length: 255 }),
    shootingDates: varchar("shooting_dates", { length: 255 }),
    auditionType: varchar("audition_type", { length: 50 }),
    auditionLocation: varchar("audition_location", { length: 255 }),
    auditionDeadline: timestamp("audition_deadline", { withTimezone: true }),
    requiredSkills: jsonb("required_skills").$type<string[]>(),
    status: callStatusEnum("status").default("draft").notNull(),
    createdBy: integer("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    projectIdx: index("calls_project_idx").on(table.projectId),
    statusIdx: index("calls_status_idx").on(table.status),
    creatorIdx: index("calls_creator_idx").on(table.createdBy),
  })
);

export type CastingCall = typeof castingCalls.$inferSelect;
export type InsertCastingCall = typeof castingCalls.$inferInsert;

/* ─── Submissions ─── */
export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    callId: integer("call_id").notNull(),
    talentId: integer("talent_id").notNull(),
    directorId: integer("director_id"),
    message: text("message"),
    mediaUrls: jsonb("media_urls").$type<string[]>(),
    status: submissionStatusEnum("status").default("pending").notNull(),
    reviewedBy: integer("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    callIdx: index("submissions_call_idx").on(table.callId),
    talentIdx: index("submissions_talent_idx").on(table.talentId),
    statusIdx: index("submissions_status_idx").on(table.status),
  })
);

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/* ─── Media Uploads ─── */
export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    type: mediaTypeEnum("type").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    fileSize: integer("file_size"),
    mimeType: varchar("mime_type", { length: 100 }),
    metadata: jsonb("metadata"),
    isApproved: boolean("is_approved").default(false).notNull(),
    approvedBy: integer("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("media_user_idx").on(table.userId),
    typeIdx: index("media_type_idx").on(table.type),
  })
);

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

/* ─── Feature Toggles ─── */
export const featureToggles = pgTable(
  "feature_toggles",
  {
    id: serial("id").primaryKey(),
    featureId: varchar("feature_id", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    enabled: boolean("enabled").default(false).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    metadata: jsonb("metadata"),
    updatedBy: integer("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    featureIdx: index("ft_feature_idx").on(table.featureId),
  })
);

export type FeatureToggle = typeof featureToggles.$inferSelect;
export type InsertFeatureToggle = typeof featureToggles.$inferInsert;

/* ─── Plans / Subscriptions ─── */
export const plans = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    monthlyPrice: integer("monthly_price"),
    yearlyPrice: integer("yearly_price"),
    features: jsonb("features").$type<string[]>(),
    isPopular: boolean("is_popular").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  }
);

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/* ─── API Keys / Config ─── */
export const apiConfigs = pgTable(
  "api_configs",
  {
    id: serial("id").primaryKey(),
    provider: varchar("provider", { length: 100 }).notNull(),
    keyName: varchar("key_name", { length: 255 }).notNull(),
    keyValue: text("key_value").notNull(),
    isEncrypted: boolean("is_encrypted").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    providerIdx: index("api_provider_idx").on(table.provider),
  })
);

export type ApiConfig = typeof apiConfigs.$inferSelect;
export type InsertApiConfig = typeof apiConfigs.$inferInsert;
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
    razorpaySignature: varchar("razorpay_signature", { length: 500 }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    status: varchar("status", { length: 50 }).notNull().default("created"),
    planSlug: varchar("plan_slug", { length: 50 }).notNull(),
    billingCycle: varchar("billing_cycle", { length: 20 }).notNull().default("monthly"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("payments_user_idx").on(table.userId),
    razorpayIdx: index("payments_razorpay_idx").on(table.razorpayOrderId),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/* ─── Subscriptions ─── */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    planSlug: varchar("plan_slug", { length: 50 }).notNull().default("free"),
    status: varchar("status", { length: 50 }).notNull().default("trial"),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("subscriptions_user_idx").on(table.userId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/* ─── Audit Logs ─── */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: integer("entity_id"),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("audit_user_idx").on(table.userId),
    actionIdx: index("audit_action_idx").on(table.action),
    entityIdx: index("audit_entity_idx").on(table.entityType, table.entityId),
    createdIdx: index("audit_created_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
