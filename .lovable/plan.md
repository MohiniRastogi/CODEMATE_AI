# Fix MCQ/Flashcard Options Not Rendering

## Root cause
In `src/routes/app.notes.tsx`, MCQ options are rendered with `toText(o)`. The AI is not strictly required to return options as plain strings, so it sometimes returns option objects (e.g. `{ "option": "...", "isCorrect": true }` or letter-keyed shapes). `toText` doesn't recognize those keys and returns `""`, so the option list renders blank while the question and answer checkmark still appear. The server function `generateNotes` in `src/lib/ai.functions.ts` (secure server-side function, not a user-facing edge function) also doesn't enforce "exactly 4 plain-string options" in its prompt.

## Changes

### 1. Server: stricter MCQ contract (`src/lib/ai.functions.ts`)
- Update the `generateNotes` prompt to require each MCQ as strict JSON:
  `{ "question": "...", "options": ["option A", "option B", "option C", "option D"], "answer": "option B" }`
  with exactly 4 plain-string options (no letter prefixes, no objects) and `answer` exactly equal to one of the options.

### 2. Frontend: robust option normalization (`src/routes/app.notes.tsx`)
- Add a `normalizeMcq(m)` helper that converts any AI shape into `{ question: string; options: string[]; answer: string }`:
  - Accept options as an array of strings or objects (pull the first string field from keys like `text`, `value`, `label`, `option`, `content`).
  - Accept options as a letter-keyed object (`{ A: ..., B: ... }`) by taking its values in order.
  - Accept a single string by splitting on newlines if it contains multiple lines.
  - Extend `toText`'s recognized keys to include `option` and `answer`.
- Use `normalizeMcq` in both the list view and the `Flashcards` mapping.

### 3. Error handling for invalid options
- After normalization, if every MCQ has fewer than 2 valid options, show a clear inline error card ("The AI returned MCQs without valid answer options — please regenerate") with a Retry button, instead of silently rendering questions with no options.
- Skip individual MCQs with fewer than 2 options (don't render a question with no choices).

### 4. Flashcard mode consistency
- In Flashcard mode, MCQ cards always show the (normalized) options list and flip only to reveal the answer — the existing flip behavior is preserved, but now with guaranteed non-empty options.

### 5. Verify
- Confirm the build passes.
- Live test: generate notes for a topic (e.g. "Binary Search Tree") and confirm all 4 options render as clickable/selectable items in both list and Flashcard modes, with the answer reveal working.

## Out of scope
- No changes to the notes prompt's other sections, the rejected markdown-quality redesign, or any other page/styling.
