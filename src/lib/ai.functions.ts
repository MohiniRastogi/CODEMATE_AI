import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createGateway, DEFAULT_MODEL } from "./ai-gateway.server";

const commonSchema = {
  program: z.object({
    productionCode: z.string(),
    beginnerCode: z.string(),
    optimizedCode: z.string(),
    lineByLine: z.array(z.string()),
    explanation: z.string(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
    exampleInput: z.string(),
    exampleOutput: z.string(),
    edgeCases: z.array(z.string()),
    bestPractices: z.array(z.string()),
    commonMistakes: z.array(z.string()),
    relatedConcepts: z.array(z.string()),
  }),
  project: z.object({
    projectName: z.string(),
    description: z.string(),
    folderStructure: z.string(),
    files: z.array(z.object({ path: z.string(), content: z.string() })),
    dependencies: z.array(z.string()),
    databaseSchema: z.string(),
    envVariables: z.array(z.object({ key: z.string(), description: z.string() })),
    readme: z.string(),
    installation: z.array(z.string()),
    execution: z.array(z.string()),
    features: z.array(z.string()),
    futureScope: z.array(z.string()),
  }),
  review: z.object({
    overallScore: z.number(),
    codeQuality: z.number(),
    performance: z.number(),
    readability: z.number(),
    security: z.number(),
    maintainability: z.number(),
    complexity: z.number(),
    optimization: z.number(),
    bugs: z.array(z.object({ issue: z.string(), why: z.string(), fix: z.string() })),
    logicErrors: z.array(z.string()),
    syntaxErrors: z.array(z.string()),
    suggestions: z.array(z.string()),
    optimizedCode: z.string(),
    fixedCode: z.string(),
    bestPractices: z.array(z.string()),
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
      `Write a ${data.difficulty} level ${data.language} program.

Task: ${data.prompt}

Return THREE variants of the solution:
- productionCode: clean, idiomatic, production-quality code with comments.
- beginnerCode: the same solution written verbosely with beginner-friendly comments.
- optimizedCode: the most performance/space optimized version.

Also return:
- lineByLine: array of short strings (one per meaningful line) that explain each line of productionCode.
- explanation: a paragraph explaining the approach.
- timeComplexity, spaceComplexity: Big-O.
- exampleInput, exampleOutput: concrete sample I/O as plain text.
- bestPractices: 4-6 items.
- commonMistakes: 4-6 items to avoid.`,
      "You are an elite programming tutor generating high-quality, correct, well-explained code across many languages.",
    );
  });

// Mini Project Generator
export const generateProject = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      language: string;
      framework?: string;
      category: string;
      difficulty: string;
      size: string;
      projectType?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.project,
      `Design a ${data.size}, ${data.difficulty} ${data.language} mini project${
        data.framework ? ` using ${data.framework}` : ""
      } in the ${data.category} category${data.projectType ? ` (${data.projectType})` : ""}.

Return a REAL, GitHub-repository-style project:
- projectName: creative, specific.
- description: 2-3 sentences.
- folderStructure: ASCII tree.
- files: an array of individual files, EACH with { path, content }. Include at minimum a main entry file, config, README.md, and any framework files. Content must be complete and runnable.
- dependencies: array of package names/versions.
- databaseSchema: SQL/prisma/schema text if the project needs one, otherwise an empty string.
- readme: full README markdown.
- installation: ordered array of shell commands.
- execution: ordered array of run/test commands.
- features: 5-8 bullet points.
- futureScope: 3-5 ideas.`,
      "You are a senior engineer producing complete, cleanly-structured multi-file mini projects.",
    );
  });

// Code Reviewer
export const reviewCode = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; language?: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.review,
      `Review this ${data.language ?? "code"} rigorously:

\`\`\`
${data.code}
\`\`\`

Score each dimension 0-100 (codeQuality, performance, readability, security, complexity, optimization) and set overallScore.
For every bug return { issue, why, fix } explaining why it is wrong and how it was fixed.
Return an optimizedCode (best performance) AND a fixedCode (original but with bugs corrected).
Also list 4-6 best-practice suggestions.`,
      "You are a strict, senior code reviewer. Be honest, specific and educational.",
    );
  });

// Notes Generator
export const generateNotes = createServerFn({ method: "POST" })
  .inputValidator((d: { topic: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.notes,
      `Create comprehensive study notes on: "${data.topic}".

Include clear definition, thorough explanation, 3-5 examples (plain strings), advantages, disadvantages, 5 interview Q&A, 4 MCQs with 4 options each and the correct answer, and a summary.`,
      "You are a computer science professor creating high-quality student notes.",
    );
  });

// Code Converter
export const convertCode = createServerFn({ method: "POST" })
  .inputValidator((d: { fromLanguage: string; toLanguage: string; code: string }) => d)
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.convert,
      `Convert this ${data.fromLanguage} code to ${data.toLanguage}:

\`\`\`${data.fromLanguage}
${data.code}
\`\`\`

Produce idiomatic ${data.toLanguage}. Explain the conversion and list 3-5 key language differences.`,
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
