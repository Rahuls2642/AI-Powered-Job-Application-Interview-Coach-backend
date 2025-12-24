import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),

  company: text("company").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  status: text("status").default("applied"),

  createdAt: timestamp("created_at").defaultNow(),
});


export const atsAnalysis = pgTable("ats_analysis", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  jobId: uuid("job_id").notNull(),

  matchScore: integer("match_score").notNull(),
  missingKeywords: text("missing_keywords"),
  suggestions: text("suggestions"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  jobId: uuid("job_id").notNull(),

  question: text("question").notNull(),
  category: text("category").notNull(), // hr | technical | behavioral

  createdAt: timestamp("created_at").defaultNow(),
});
