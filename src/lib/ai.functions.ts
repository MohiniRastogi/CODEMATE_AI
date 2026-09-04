import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import {
  AiGatewayError,
  createGateway,
  DEFAULT_MODEL,
  runCodeReviewWithGateway,
} from "./ai-gateway.server";

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
    testFiles: z.array(z.object({ path: z.string(), content: z.string() })),
    testCommand: z.string(),
    browserTests: z.array(z.object({ name: z.string(), code: z.string() })),
  }),
  review: z.object({
    summary: z.string(),
    score: z.number(),
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
    securityConcerns: z.array(z.string()),
    performanceIssues: z.array(z.string()),
    codeQualityIssues: z.array(z.string()),
    recommendations: z.array(z.string()),
    suggestions: z.array(z.string()),
    detectedLanguage: z.string(),
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
  file: z.object({
    path: z.string(),
    content: z.string(),
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
    const result = streamText({
      model: gateway(DEFAULT_MODEL),
      output: Output.object({ schema }),
      system,
      prompt,
    });
    const output = await result.output;
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
        console.error("[runStructured] AI returned an invalid structured response");
        throw new Error("AI returned an invalid response. Please try again.");
      }
    }
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

Write the SHORTEST correct solution — no dead code, no unnecessary abstractions, no unused imports.

Return THREE variants:
- productionCode: clean, idiomatic, production-ready code with concise comments only where they add value.
- beginnerCode: same logic written step-by-step with beginner-friendly comments.
- optimizedCode: the most time/space efficient version.

Also return:
- lineByLine: short strings explaining each meaningful line of productionCode.
- explanation: one focused paragraph on the approach.
- timeComplexity, spaceComplexity: Big-O with a short reason.
- exampleInput, exampleOutput: concrete plain-text sample I/O.
- edgeCases: 3-5 edge cases the solution handles (or should).
- bestPractices: 4-6 items.
- commonMistakes: 4-6 items to avoid.
- relatedConcepts: 3-5 related topics worth learning next.`,
      "You are an elite programming tutor. Generate correct, minimal, efficient and well-explained code. Never pad the answer with unnecessary code.",

    );
  });

// Mini Project Generator
export const generateProject = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      idea: string;
      language: string;
      framework?: string;
      category?: string;
      difficulty?: string;
      size?: string;
      projectType?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.project,
      `Build a complete, working ${data.language} mini project for this idea: "${data.idea}".
${data.framework ? `Framework: ${data.framework}.\n` : ""}${data.category ? `Category: ${data.category}.\n` : ""}${data.projectType ? `Project type: ${data.projectType}.\n` : ""}${data.difficulty ? `Difficulty: ${data.difficulty}.\n` : ""}${data.size ? `Size: ${data.size}.\n` : ""}
For anything not specified above, infer sensible values yourself from the idea and the language.

CORRECTNESS IS THE PRIORITY. The code must actually implement the idea and run as-is:
- No placeholders, no TODOs, no "implement this" stubs, no truncated files.
- Implement the real logic (e.g. Tic Tac Toe needs genuine win/draw detection; a Calculator must handle operator precedence or clear sequential evaluation plus divide-by-zero; a quiz must score correctly).
- Handle obvious edge cases and invalid input.
- If the language is JavaScript/TypeScript/HTML/CSS and the idea is a game, calculator, or simple web app, produce a browser-runnable project with an index.html at the project root plus real CSS and JS so it can be opened directly in a browser. Reference stylesheets/scripts with relative paths (style.css, script.js) and avoid build steps or external CDNs.

Return a REAL, GitHub-repository-style project:
- projectName: creative, specific, clearly matching the idea.
- description: 2-3 sentences.
- folderStructure: ASCII project tree of every file listed below.
- files: array of SEPARATE files, EACH with { path, content }. NEVER merge multiple files into one entry. Include the entry file, config, models/routes/helpers as appropriate, requirements/package manifest, .env.example and README.md. Every file's content must be complete and runnable.
- dependencies: package names with versions.
- databaseSchema: SQL/Prisma schema text if the project needs one, otherwise an empty string.
- envVariables: array of { key, description } for every environment variable (empty array if none).
- readme: full README markdown.
- installation: ordered shell commands.
- execution: ordered run/test commands.
- features: 5-8 bullet points.
- futureScope: 3-5 future improvements.

TESTS (required):
- testFiles: 1-3 real unit test files for the project's core logic, using the idiomatic test framework for the language (pytest, JUnit, Jest, go test, etc.). Complete and runnable, with their own { path, content }. Do NOT repeat them inside "files".
- testCommand: the single shell command that runs those tests (e.g. "pytest", "npm test").
- browserTests: 4-8 SMALL JavaScript assertion snippets that can run in a browser against the project's own script files. Each { name, code } where code is plain JS that throws an Error when the test fails and returns normally when it passes. They may only call functions/variables the project's JS defines globally, or re-implement pure logic inline. Return an empty array ONLY when the project has no browser-runnable JavaScript.`,
      "You are a senior engineer producing complete, cleanly-structured multi-file mini projects that look like real GitHub repositories. Every file you write must be finished, logically correct and runnable — never scaffolding.",
    );
  });

// Regenerate a single file of an existing project
export const regenerateProjectFile = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      projectName: string;
      idea: string;
      language: string;
      path: string;
      currentContent: string;
      otherPaths: string[];
      instruction?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    return runStructured(
      commonSchema.file,
      `Project "${data.projectName}" (${data.language}) built for the idea: "${data.idea}".
Other files in the project: ${data.otherPaths.join(", ") || "(none)"}.

Rewrite ONLY the file "${data.path}". ${data.instruction ?? "Improve correctness, completeness and comments while keeping the same responsibility and staying compatible with the other files."}

Current content:
\`\`\`
${data.currentContent}
\`\`\`

Return { path, content }. Keep the same path. content must be the complete file — no placeholders or TODOs.`,
      "You are a senior engineer rewriting a single file of an existing project. Stay consistent with the rest of the codebase.",
    );
  });

// Code Reviewer
const MAX_REVIEW_CODE_LENGTH = 30000;
const reviewInputSchema = z.object({
  code: z.string().trim().min(1, "Paste some code first").max(MAX_REVIEW_CODE_LENGTH, "Code is too large to review"),
  language: z.string().trim().max(40).optional(),
});

const reviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary", "score", "overallScore", "codeQuality", "performance", "readability",
    "security", "maintainability", "complexity", "optimization", "bugs", "logicErrors",
    "syntaxErrors", "securityConcerns", "performanceIssues", "codeQualityIssues",
    "recommendations", "suggestions", "detectedLanguage", "optimizedCode", "fixedCode",
    "bestPractices",
  ],
  properties: {
    summary: { type: "string" },
    score: { type: "number" },
    overallScore: { type: "number" },
    codeQuality: { type: "number" },
    performance: { type: "number" },
    readability: { type: "number" },
    security: { type: "number" },
    maintainability: { type: "number" },
    complexity: { type: "number" },
    optimization: { type: "number" },
    bugs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "why", "fix"],
        properties: { issue: { type: "string" }, why: { type: "string" }, fix: { type: "string" } },
      },
    },
    logicErrors: { type: "array", items: { type: "string" } },
    syntaxErrors: { type: "array", items: { type: "string" } },
    securityConcerns: { type: "array", items: { type: "string" } },
    performanceIssues: { type: "array", items: { type: "string" } },
    codeQualityIssues: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
    detectedLanguage: { type: "string" },
    optimizedCode: { type: "string" },
    fixedCode: { type: "string" },
    bestPractices: { type: "array", items: { type: "string" } },
  },
} satisfies Record<string, unknown>;

export const reviewCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reviewInputSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const raw = await runCodeReviewWithGateway(
        "You are an expert software engineer and code reviewer. Analyze submitted source code carefully. Identify actual bugs and potential problems without inventing issues. Review security, correctness, performance, readability, maintainability, and best practices. Explain findings clearly for a developer. Give practical recommendations. If suggesting replacement code, preserve the intended functionality. Return only the requested structured data.",
        `Review this ${data.language || "code"} rigorously. If no language is supplied, infer it from the source.

\`\`\`
${data.code}
\`\`\`

Return structured review data. Set score and overallScore to the same integer from 0-100. Include a concise overall summary and the detected language.
- securityConcerns: concrete security risks only (empty if none).
- performanceIssues: concrete performance concerns only (empty if none).
- codeQualityIssues: concrete quality/readability concerns only (empty if none).
- recommendations and suggestions: practical improvements.
- bugs: for EVERY defect return { issue, why, fix } explaining why it is wrong and exactly how it was corrected.
- logicErrors: incorrect behaviour / wrong results (empty array if none).
- syntaxErrors: code that will not compile or parse (empty array if none).
- fixedCode: the original code with all bugs corrected.
- optimizedCode: the best-performing rewrite.
- bestPractices: 4-6 items.`,
        reviewJsonSchema,
      );
      return commonSchema.review.parse(JSON.parse(raw));
    } catch (error) {
      const status = error instanceof AiGatewayError ? error.status : "invalid-response";
      console.error(`[reviewCode] AI service request failed (${status})`);
      if (error instanceof AiGatewayError) throw new Error(error.message);
      if (error instanceof z.ZodError || error instanceof SyntaxError) {
        throw new Error("AI review returned an unexpected response. Please try again.");
      }
      throw new Error("AI review service is currently unavailable. Please try again later.");
    }
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
