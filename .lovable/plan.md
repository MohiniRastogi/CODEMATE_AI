# CodeMateAI — Build Plan

A premium, light-themed, mobile-first web app matching your spec. Lovable builds web apps, so this ships as a responsive PWA that looks and behaves like the Android design (can be wrapped as an APK later via Capacitor). No login, no signup, no OTP — users open the app and go.

## 1. Design system (src/styles.css)

- Font: Poppins 300/400/500/600/700 via `<link>` in `__root.tsx`.
- Semantic tokens (no hardcoded colors in components): background `#F8FAFC`, surface `#FFFFFF`, primary `#2563EB`, secondary `#7C3AED`, accent `#06B6D4`, success `#22C55E`, warning `#F59E0B`, danger `#EF4444`, text `#0F172A`, subtitle `#64748B`.
- Gradient tokens: `--gradient-blue` (#2563EB→#06B6D4), `--gradient-purple` (#7C3AED→#EC4899), `--gradient-green` (#22C55E→#14B8A6), `--gradient-orange` (#F59E0B→#FB7185).
- Rounded 2xl/3xl radii, soft shadows, glassmorphism (backdrop-blur), animated cards, ripple, shimmer, skeleton, page transitions. Dark theme intentionally omitted.

## 2. Routes

```
/                     Splash (2s auto-advance)
/onboarding           3 slides (skipped after first visit)
/app                  Layout with bottom nav + <Outlet />
  /app                Home Dashboard
  /app/history        History
  /app/saved          Saved
  /app/settings       Settings
/app/program          Program Generator
/app/project          Mini Project Generator
/app/review           Code Reviewer
/app/notes            Notes Generator
/app/convert          Code Converter
/app/interview        Interview Preparation
/app/challenge        Daily Coding Challenge
```

Splash checks `localStorage.codemate.onboarded` and routes to `/onboarding` or `/app`. Each route has its own `head()` with unique title/description/og tags.

## 3. Screens (exactly per spec)

- **Splash** — animated gradient bg, floating code symbols, centered `<> CodeMateAI` + tagline, fade-in.
- **Onboarding** — 3 slides with AI-generated illustrations, dots, Skip/Next, final "Start Coding →".
- **Home Dashboard** — greeting header, notification + search icons, gradient hero banner, 2-col grid of 7 gradient feature cards (Program, Project, Review, Notes, Convert, Interview, Challenge), then Recent Activity + Today's Challenge + Coding Tip cards.
- **Program Generator** — language + difficulty dropdowns, prompt textarea, gradient Generate; output: code + explanation + time/space complexity; Copy / Share / Save / Regenerate.
- **Mini Project Generator** — language / category / difficulty / size → project name, overview, folder tree, README, deps, source, future scope.
- **Code Reviewer** — paste code → overall score, quality, performance, readability, security, optimization, bug detection, suggestions, optimized code.
- **Notes Generator** — topic input → definition, explanation, examples, pros/cons, interview Qs, MCQs, summary. Download PDF button with "coming soon" badge.
- **Code Converter** — from/to language, editor, converted code + explanation + language differences.
- **Interview Prep** — category chips (Python, Java, DBMS, OS, CN, OOPS, HR, JS) → question, answer, examples, tips, follow-ups, Next / Bookmark.
- **Daily Challenge** — challenge card, difficulty badge, hints, solution, complexity, Mark Complete with confetti.
- **History** — tabs (Programs / Notes / Reviews / Projects / Challenges), search, per-item delete, Clear All.
- **Saved** — bookmarked cards, sort Newest/Oldest, filter by feature.
- **Settings** — theme (Light, locked), version, privacy, terms, feedback, rate, share, about.
- Empty states illustrated + friendly copy; error states with Retry; loading via shimmer + streaming tokens.

## 4. AI integration

- Enable **Lovable Cloud** to provision `LOVABLE_API_KEY` server-side.
- Shared gateway helper `src/lib/ai-gateway.server.ts`.
- One `.functions.ts` per feature (`createServerFn`) owning its prompt template, calling `google/gemini-3.6-flash` (fast, strong at code). Structured output via `Output.object` + Zod where the UI needs discrete fields.
- Streaming (chat-style route) for Program Generator, Code Reviewer, Notes, Interview; one-shot for Convert and Daily Challenge.
- Errors mapped to friendly UI: 429 → "AI is busy, try again"; 402 → "Free AI credits exhausted — add credits in workspace billing".

## 5. Local storage

Typed wrapper in `src/lib/storage.ts`: `history` (per feature type), `bookmarks`, `settings`, `challengeProgress`, `onboarded`. Save/bookmark from every feature output; History and Saved screens read from here. No backend tables. Auth deferred.

## 6. Responsive & performance

Designed for 360/390/412dp phones, scales up to tablet. Lazy route loading, reusable Card/Button/Skeleton components, memoized lists, ≥44px tap targets, safe-area padding.

## 7. Technical details

- Stack: TanStack Start + React 19 + Tailwind v4 (scaffolded).
- Icons: `lucide-react`. Animations: `tw-animate-css` + light `motion/react` for transitions. Confetti: `canvas-confetti`.
- Code display: `react-syntax-highlighter`. Markdown: `react-markdown`.
- AI: `ai` + `@ai-sdk/openai-compatible` via Lovable AI Gateway, model `google/gemini-3.6-flash`. Prompts in `src/lib/prompts/*`.
- State: TanStack Query for AI calls; localStorage for persistence.
- SEO: unique `head()` per route; home stays clean of og:image so hosting can inject a screenshot.

## 8. Out of scope for v1

- Authentication / accounts / OTP.
- Real PDF export (button shows "coming soon" badge as specified).
- Cloud sync.
- Native Android packaging (can be added later via Capacitor without app changes).

Approve and I'll build it end-to-end.