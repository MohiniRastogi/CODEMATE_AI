import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createGateway, DEFAULT_MODEL } from "./ai-gateway.server";

const commonSchema = {
  program: z.object({
    code: z.string(),
    explanation: z.string(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
  }),
  project: z.object({
    projectName: z.string(),
    overview: z.string(),
    folderStructure: z.string(),
    readme: z.string(),
    dependencies: z.array(z.string()),
    sourceCode: z.string(),
    futureScope: z.array(z.string()),
  }),
  review: z.object({
    overallScore: z.number(),
    codeQuality: z.number(),
    performance: z.number(),
    readability: z.number(),
    security: z.number(),
    optimization: z.number(),
    bugs: z.array(z.string()),
    suggestions: z.array(z.string()),
    optimizedCode: z.string(),
  }),
  notes: z.object({
    definition: z.string(),
    explanation: z.string(),
    examples: z.array(z.string()),
    advantages: z.array(z.string()),
    disadvantages: z.array(z.string()),
    interviewQuestions: z.array(z.object({ q: z.string(), a: z.string() })),
    mcqs: z.array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string(),
      }),
    ),
    summary: z.string(),
  }),
  convert: z.object({
    convertedCode: z.string(),
    explanation: z.string(),
    languageDifferences: z.array(z.string()),
  }),
  interview: z.object({
    question: z.string(),
    answer: z.string(),
    examples: z.array(z.string()),
    tips: z.array(z.string()),
    followUps: z.array(z.string()),
  }),
  challenge: z.object({
    title: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    question: z.string(),
    hints: z.array(z.string()),
    solution: z.string(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
  }),
};

async function runStructured<T extends z.ZodTypeAny>(
  schema: T,
  prompt: string,
  system?: string,
): Promise<z.infer<T>> {
  const gateway = createGateway();
  try {
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      output: Output.object({ schema }),
      system,
      prompt,
    });
    return output as z.infer<T>;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      const raw = error.text ?? "";
      const cleaned = raw
        .replace(/^\s*```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      const candidate = match ? match[0] : cleaned;
      try {
        return JSON.parse(candidate) as z.infer<T>;
      } catch {
        console.error("[runStructured] Failed to parse AI response:", raw);
        throw new Error("AI returned an invalid response. Please try again.");
      }
    }
    console.error("[runStructured] AI call failed:", error);
    throw error;
  }
}

// Program Generator
export const generateProgram = createServerFn({ method: "POST" })
  .inputValidator((d: { language: string; difficulty: string; prompt: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.program,
      `Write a ${data.difficulty} level ${data.language} program.\n\nTask: ${data.prompt}\n\nReturn clean, production-quality code with clear comments. Include a plain-language explanation and Big-O time/space complexity.`,
      "You are an expert programming tutor generating high-quality code with clear teaching commentary.",
    );
  });

// Mini Project Generator
export const generateProject = createServerFn({ method: "POST" })
  .inputValidator((d: { language: string; category: string; difficulty: string; size: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.project,
      `Design a ${data.size}, ${data.difficulty} ${data.language} mini project in the ${data.category} category.\n\nInclude a creative project name, one-paragraph overview, ASCII folder structure, README markdown, dependency list, complete working source code (concatenated with file separators like // === filename ===), and 3-5 future scope ideas.`,
      "You are a senior engineer designing beginner-friendly but complete mini projects.",
    );
  });

// Code Reviewer
export const reviewCode = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; language?: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.review,
      `Review this ${data.language ?? "code"} rigorously:\n\n\`\`\`\n${data.code}\n\`\`\`\n\nScore each dimension 0-100. List concrete bugs and suggestions. Provide an optimized version.`,
      "You are a strict senior code reviewer. Be honest and specific.",
    );
  });

// Notes Generator
export const generateNotes = createServerFn({ method: "POST" })
  .inputValidator((d: { topic: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.notes,
      `Create comprehensive study notes on: "${data.topic}".\n\nInclude clear definition, thorough explanation, 3-5 examples, advantages, disadvantages, 5 interview Q&A, 4 MCQs with 4 options each and the correct answer, and a summary.`,
      "You are a computer science professor creating high-quality student notes.",
    );
  });

// Code Converter
export const convertCode = createServerFn({ method: "POST" })
  .inputValidator((d: { fromLanguage: string; toLanguage: string; code: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.convert,
      `Convert this ${data.fromLanguage} code to ${data.toLanguage}:\n\n\`\`\`${data.fromLanguage}\n${data.code}\n\`\`\`\n\nProduce idiomatic ${data.toLanguage}. Explain the conversion and list 3-5 key language differences.`,
      "You are a polyglot programmer expert in language translation.",
    );
  });

// Interview
export const generateInterview = createServerFn({ method: "POST" })
  .inputValidator((d: { category: string; previousQuestions?: string[] }) => d)
  .handler(async ({ data }) => {
    const avoid = data.previousQuestions?.length
      ? `\n\nAvoid repeating any of these: ${data.previousQuestions.slice(0, 8).join(" | ")}`
      : "";
    return runStructured(
      commonSchema.interview,
      `Generate one thoughtful ${data.category} interview question with a detailed model answer, 2 examples, 3 tips, and 3 follow-up questions.${avoid}`,
      "You are an experienced interviewer at a top tech company.",
    );
  });

// Daily Coding Challenge
export const generateChallenge = createServerFn({ method: "POST" })
  .inputValidator((d: { seed: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.challenge,
      `Generate today's coding challenge. Use seed "${data.seed}" for variety. Include a clear title, difficulty, problem statement with examples, 3 progressive hints, a clean Python solution, and time/space complexity.`,
      "You are a competitive programming coach.",
    );
  });
