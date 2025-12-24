import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function extractJSON(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in Gemini response");
  }
  return JSON.parse(match[0]);
}

export async function analyzeResumeWithJD(
  resume: string,
  jobDescription: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an ATS system.

Compare the RESUME with the JOB DESCRIPTION.
Return ONLY a JSON object. No markdown. No explanation.

JSON format:
{
  "matchScore": number,
  "missingKeywords": "comma separated keywords",
  "suggestions": "clear improvement suggestions"
}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  return extractJSON(rawText);
}
export async function generateInterviewQuestions(
  jobDescription: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.0-pro",
  });

  const prompt = `
Generate interview questions for the following job description.

Return plain text.
Format exactly like this:

HR:
- question
- question

TECHNICAL:
- question
- question

BEHAVIORAL:
- question
- question

JOB DESCRIPTION:
${jobDescription}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
