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

export const answers = pgTable("answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  questionId: uuid("question_id").notNull(),

  answer: text("answer").notNull(),
  feedback: text("feedback").notNull(),
  improvedAnswer: text("improved_answer").notNull(),
  score: integer("score").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});


export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  // extracted resume text (from PDF)
  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
