# Improve Notes Generator AI output quality

## What changes

### 1. Stronger AI prompt + richer structure (server-side, `src/lib/ai.functions.ts`)

The Notes Generator calls Lovable's managed AI from a secure server function (the credential stays server-side; nothing changes there). Only the prompt and response shape change.

Update the `generateNotes` prompt and system instruction so every note follows one consistent, teacher-quality format:

- **One-line definition** first, then a thorough explanation organized with markdown `##`/`###` subheadings inside the explanation field.
- **Key concepts** explained in simple language, with **bold** key terms.
- **Examples** that include a short code snippet where relevant (markdown fenced code blocks).
- New **Common pitfalls** section — things people get wrong (replaces guesswork with a dedicated field).
- **Numbered steps** for any process/sequence.
- **Length matched to complexity** — no filler for simple topics, no oversimplifying complex ones.
- **Consistent structure every time** — the prompt will spell out the exact section order.

Schema additions (kept backward-compatible so saved/history notes keep rendering): add `keyConcepts` (array of `{ term, explanation }`) and `pitfalls` (array of strings). All existing fields (definition, explanation, examples, advantages, disadvantages, interview questions, MCQs, summary) stay, with upgraded prompt guidance for depth.

### 2. Markdown rendering in the UI (`src/routes/app.notes.tsx`)

- Add a small `Markdown` component using the already-installed `react-markdown` (no new dependency), rendering headings, bold, bullet/numbered lists, and fenced code via the existing `CodeBlock` component for syntax highlighting.
- Render `definition`, `explanation`, `examples`, and `summary` through it so `##` headings, `**bold**`, lists, and code blocks display formatted instead of as raw text.
- Add new "Key Concepts" (term + explanation cards) and "Common Pitfalls" sections to the results layout, matching existing card styling — no design changes.
- Update the Export `.md` builder to include the new Key Concepts and Pitfalls sections.

### 3. Verify

- Generate notes for a simple topic and a complex one; confirm consistent structure, markdown renders correctly, and export works.
- Confirm saved-notes page and history still render older notes without errors (schema is additive only).

## Technical notes

- Files touched: `src/lib/ai.functions.ts` (prompt + schema), `src/routes/app.notes.tsx` (rendering + export). No new packages; `react-markdown` is already in `package.json`.
- No changes to routing, theming, or other tools.
