import { Request, Response } from "express";
import { db } from "../db/index.js";
import { interviewQuestions, answers } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { evaluateAnswer } from "../services/ai.services.js";

export const submitAnswer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;
  const { questionId, answer } = req.body;

  if (!questionId || !answer) {
    return res.status(400).json({ error: "questionId and answer required" });
  }

  const [question] = await db
    .select()
    .from(interviewQuestions)
    .where(
      and(
        eq(interviewQuestions.id, questionId),
        eq(interviewQuestions.userId, userId)
      )
    );

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  const aiResult = await evaluateAnswer(question.question, answer);

  const [saved] = await db
    .insert(answers)
    .values({
      userId,
      questionId,
      answer,
      feedback: aiResult.feedback,
      improvedAnswer: aiResult.improvedAnswer,
      score: aiResult.score,
    })
    .returning();

  res.status(201).json(saved);
};

export const getAnswersByQuestion = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;
  const { questionId } = req.params;

  const data = await db
    .select()
    .from(answers)
    .where(
      and(
        eq(answers.questionId, questionId),
        eq(answers.userId, userId)
      )
    )
    .orderBy(answers.createdAt);

  res.json(data);
};
