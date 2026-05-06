# Repository Guidelines

МакедоТест is a Vite + React 18 single-page app for authoring printable Macedonian/Albanian school tests with strong STEM (KaTeX) support, Firebase-backed question banks, and QTI/AI import/export.

## Project Structure & Module Organization
- `src/main.jsx` — root module containing the app shell, state, Firestore wiring, import/export, printing logic, and `App` default export. Currently being progressively decomposed (see `FUTURE_PLAN.md` §1.6).
- `src/components/` — feature-rich UI components:
  - `LandingPage.jsx` — entry/landing UI.
  - `Question.jsx` — editor for all 16 question formats (Multiple Choice, Checklist, True/False, Inline Selection, Multi-Match, Interactive Tables, etc.).
  - `RenderContent.jsx` — KaTeX/STEM-aware text renderer used across views.
- `src/i18n/` — UI translations (`mk`, `sq`) + `createTranslator(lang)`; the canonical place to add new locale strings.
- `src/lib/firebase.js` — single Firebase init (`auth`, `db`, `APP_ID`); reads only `import.meta.env.VITE_FIREBASE_*`. Never re-initialize Firebase elsewhere.
- `src/domain/schema.js` — Zod schemas for all 16 question types + `TestSchema`; use `parseQuestionList`/`parseTest` for any external/AI/JSON input before touching app state.
- `src/test/setup.js` — Vitest + Testing Library bootstrap (loaded automatically via `vite.config.js`).
- `index.html` — Vite entry; loads Tailwind via the `cdn.tailwindcss.com` script (local PostCSS migration is in plan §1.4).
- `backup_v6_pro_visuals/` and `backup_v6_stable/` — frozen historical snapshots; do not edit unless restoring an older version. Excluded from lint/format/coverage.
- `FUTURE_PLAN.md`, `AI_IMPORT_PROMPT.md`, `DOCUMENTATION.md` — product/spec notes; treat as reference, not as runtime sources.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start the Vite dev server.
- `npm run build` — production build to `dist/` (`chunkSizeWarningLimit` is raised to 1600 in `vite.config.js`).
- `npm run preview` — serve the built bundle locally.
- `npm run lint` / `npm run lint:fix` — ESLint over `src/**/*.{js,jsx,ts,tsx}`.
- `npm run format` / `npm run format:check` — Prettier over `src/**`.
- `npm test` — Vitest single run; `npm run test:watch` for watch mode; `npm run coverage` for v8 coverage.
- Run a single test file: `npx vitest run src/domain/schema.test.js`.

## Coding Style & Naming Conventions
- JavaScript + JSX today; TypeScript migration is on the roadmap (plan §1.3) — new code may be `.ts`/`.tsx`.
- ES modules (`"type": "module"`); use `import`/`export`, not CommonJS.
- Prettier rules: single quotes, semicolons, 100-col width, 2-space indent, trailing commas (`es5`), LF line endings.
- ESLint extends `eslint:recommended`, `react`, `react-hooks`, `jsx-a11y`, `prettier`. `console.log` is a warning (allow `console.warn`/`console.error`).
- React function components in PascalCase files under `src/components/`; reusable cross-cutting code goes in `src/i18n/`, `src/lib/`, `src/domain/`.
- Tailwind utility classes are the styling system — keep markup class-driven; do not add inline CSS files until the local PostCSS pipeline lands (plan §1.4).
- UI strings are Macedonian/Albanian; never hardcode in components — add to `src/i18n/translations.js` and look up via `t(key)`.
- Use KaTeX `$ ... $` syntax for math; route rendering through `RenderContent.jsx` rather than inlining new renderers.
- Validate any externally sourced JSON (paste import, AI generation, QTI) with `parseQuestionList` / `parseTest` before storing in state.

## Testing Guidelines
- Framework: Vitest + `@testing-library/react` + `@testing-library/jest-dom`; environment is `jsdom`.
- Co-locate unit tests next to the module: `src/domain/schema.test.js`, `src/i18n/translations.test.js`, etc.
- Add a test whenever you touch `src/domain/` or `src/i18n/` — these are the contractual boundaries with AI imports and localization.
- Coverage excludes `src/main.jsx` until the refactor in plan §1.6 lands.

## Configuration & Secrets
- Firebase config lives only in `src/lib/firebase.js`; it reads `VITE_FIREBASE_*` env vars. Copy `.env.example` → `.env` for local dev. Never commit `.env` or hardcode keys.
- `.gitignore` covers `node_modules`, `dist`, `.env*`, `.DS_Store`, `*.log`, `coverage`, `.vite`.

## Commit & Pull Request Guidelines
- History uses short imperative subjects, frequently `Snake_Case_With_Underscores` (e.g. `Implement_Cloud_Saving_for_Tests`, `Fix_Print_View_and_Add_Live_STEM_Preview_in_Editor`); occasional plain `update`. Match the prevailing style: a single concise line describing the change.
- No PR template is present. When opening a PR, summarize user-visible changes, list affected question formats/views, and attach screenshots for any print-layout or STEM-rendering work.
