import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ------------------------------------------------------------------ */
/* CodinCloud Academy                                                  */
/* ------------------------------------------------------------------ */

export const academyProfiles = mysqlTable(
  "academy_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["learner", "coach", "interviewer", "admin"])
      .default("learner")
      .notNull(),
    preferredLanguage: varchar("preferredLanguage", { length: 8 })
      .default("fr")
      .notNull(),
    secondLanguage: varchar("secondLanguage", { length: 8 }).default("ar"),
    status: mysqlEnum("status", ["active", "paused"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => [uniqueIndex("academy_profiles_user_idx").on(t.userId)],
);

export const scenarios = mysqlTable(
  "scenarios",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 96 }).notNull(),
    folio: int("folio").notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    product: varchar("product", { length: 64 }).notNull(),
    sector: varchar("sector", { length: 64 }).notNull(),
    persona: varchar("persona", { length: 220 }).notNull(),
    language: varchar("language", { length: 8 }).notNull(),
    languagePair: varchar("languagePair", { length: 16 }),
    difficulty: mysqlEnum("difficulty", [
      "starter",
      "intermediate",
      "advanced",
      "expert",
    ])
      .default("intermediate")
      .notNull(),
    modality: mysqlEnum("modality", ["audio", "text"]).default("audio").notNull(),
    summary: text("summary").notNull(),
    brief: text("brief").notNull(),
    coachingFocus: text("coachingFocus").notNull(),
    competencies: text("competencies").notNull(),
    rubric: text("rubric").notNull(),
    durationSeconds: int("durationSeconds").default(0).notNull(),
    factVersion: varchar("factVersion", { length: 32 }).default("v1.0").notNull(),
    status: mysqlEnum("status", ["published", "draft", "archived"])
      .default("published")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [uniqueIndex("scenarios_slug_idx").on(t.slug)],
);

export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 64 }).default("audio/mpeg").notNull(),
  durationSeconds: int("durationSeconds").default(0).notNull(),
  language: varchar("language", { length: 8 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assignments = mysqlTable(
  "assignments",
  {
    id: int("id").autoincrement().primaryKey(),
    learnerId: int("learnerId").notNull(),
    scenarioId: int("scenarioId").notNull(),
    coachId: int("coachId"),
    dueAt: timestamp("dueAt"),
    status: mysqlEnum("status", ["assigned", "in_progress", "submitted", "reviewed"])
      .default("assigned")
      .notNull(),
    seedSource: mysqlEnum("seedSource", ["admin", "demo"]).default("admin").notNull(),
    consentState: mysqlEnum("consentState", ["granted", "revoked"])
      .default("granted")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => [uniqueIndex("assignments_learner_scenario_idx").on(t.learnerId, t.scenarioId)],
);

export const practiceAttempts = mysqlTable("practice_attempts", {
  id: int("id").autoincrement().primaryKey(),
  learnerId: int("learnerId").notNull(),
  scenarioId: int("scenarioId").notNull(),
  assignmentId: int("assignmentId"),
  mode: mysqlEnum("mode", ["structured", "roleplay", "listen"])
    .default("structured")
    .notNull(),
  language: varchar("language", { length: 8 }).default("fr").notNull(),
  transcript: text("transcript"),
  reflection: text("reflection"),
  status: mysqlEnum("status", ["draft", "submitted", "reviewed"])
    .default("submitted")
    .notNull(),
  aiCoaching: text("aiCoaching"),
  aiShared: boolean("aiShared").default(false).notNull(),
  durationSeconds: int("durationSeconds").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const rubricScores = mysqlTable("rubric_scores", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  dimension: varchar("dimension", { length: 48 }).notNull(),
  score: int("score").notNull(),
  maxScore: int("maxScore").notNull(),
  attribution: mysqlEnum("attribution", ["human", "ai"]).default("human").notNull(),
  feedback: text("feedback"),
  reviewerId: int("reviewerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const consentRecords = mysqlTable(
  "consent_records",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    purpose: varchar("purpose", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["granted", "revoked"]).default("revoked").notNull(),
    policyVersion: varchar("policyVersion", { length: 16 }).default("2026-11").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => [uniqueIndex("consent_user_purpose_idx").on(t.userId, t.purpose)],
);

export const productFacts = mysqlTable("product_facts", {
  id: int("id").autoincrement().primaryKey(),
  product: varchar("product", { length: 64 }).notNull(),
  version: varchar("version", { length: 32 }).notNull(),
  status: mysqlEnum("status", ["draft", "approved", "superseded"])
    .default("draft")
    .notNull(),
  content: text("content").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"),
  action: varchar("action", { length: 64 }).notNull(),
  entity: varchar("entity", { length: 48 }).notNull(),
  entityId: int("entityId"),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AcademyProfile = typeof academyProfiles.$inferSelect;
export type Scenario = typeof scenarios.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type PracticeAttempt = typeof practiceAttempts.$inferSelect;
export type RubricScore = typeof rubricScores.$inferSelect;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type ProductFact = typeof productFacts.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
