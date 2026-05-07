# 🌍 МакедоТест → Глобална платформа: Акционен План

> Визија: Светски водечка платформа за **формативно и сумативно** оценување, со балансиран фокус врз **дигитално решавање** и **печатени тестови**, со предност во STEM-рендерирање и локализација.

---

## 📊 Status Quo (полазна точка)

**Силни страни:** 16 типови задачи, KaTeX/STEM, А4 print + ZipGrade, Firebase auth/Firestore, AI JSON import, QTI извоз, mk/sq.

**Технички долг:**
- `src/main.jsx` е 62 KB монолит (state, Firebase, import/export, print, UI shell — сè во еден фајл).
- Без тестови, без ESLint/Prettier, без TypeScript.
- Tailwind преку CDN (без purge/JIT).
- Без CI/CD, без error monitoring, без analytics.
- Нема student-facing taking experience и auto-grading.
- `.env` неподокументиран; нема `env.example`.

---

## 🚦 Roadmap по фази

### Фаза 1 — Foundation Hardening (1–2 месеци)
Цел: одржливо и безбедно за тим од 3+ инженери.

- [x] **1.1** Tooling: ESLint + Prettier + EditorConfig + lint-staged + Husky (инсталирани)
- [x] **1.2** Vitest 2.x + React Testing Library + jest-dom (Node 20/22/24 compat)
- [ ] **1.3** TypeScript migration (постепено, нов код во `.tsx`)
- [x] **1.4** Tailwind локално (PostCSS + autoprefixer + design tokens во `tailwind.config.js`)
- [x] **1.5** `.env.example` + `src/lib/firebase.js` (централизирана, со dev warning за missing keys)
- [x] **1.6** Refactor `main.jsx` → modular: `i18n/`, `lib/firebase`, `domain/schema`, `store/testStore`, `hooks/useAuth`, `features/grading`, `features/import-export`, `features/take` ✓ (преостана: `features/editor`, `features/preview`, `features/print`, `features/bank`)
- [x] **1.7** Domain schema со Zod за сите 16 типови (`src/domain/schema.js`, 9 тестови)
- [x] **1.8** CI: GitHub Actions (`.github/workflows/ci.yml`) — lint + format + test + coverage + build на Node 20/22; PR template

### Фаза 2 — Student Mode & Auto-Grading (2–3 месеци) ⭐
Најголем impact vs. Quizizz/Kahoot/Google Forms.

- [x] **2.1** Public test links (`/t/ABC123` или `?code=`): `features/take/route.js`, `publish.js` (Firestore /artifacts/{APP_ID}/publishedTests/{code}), `TakeRoute.jsx` mounted во `main.jsx`
- [x] **2.2 (MVP)** Live taking UI: localStorage auto-save, progress bar, a11y semantika (radiogroup/fieldset)
- [x] **2.3** Auto-grading engine со партијален кредит за 8 типа (`src/features/grading/grade.js`, 31 тест)
- [x] **2.4** Manual rubric placeholder (essay/short-answer/fill-blanks/list/diagram/table → `requiresManual: true`)
- [x] **2.5** Lockdown mode (lite): `useLockdown` hook (fullscreen, blur/visibility, copy/paste/cut/contextmenu блокирани и логирани) интегриран во `StudentTake` преку `lockdown` prop (7 тестови)
- [x] **2.6** PWA + IndexedDB offline mode
- [x] **2.7** Resume token (продолжи на друг уред): URL `?r=<token>` + Firestore `publishedResumes` save/load + `StudentTake` token UX
- [x] **2.8** RAG foundation (Google Embeddings 2 via backend proxy): chunking, indexing API, retrieval API, namespace isolation, feature flag rollout
- [ ] **2.9** Secure submission chain (Macedonian Dugga-grade): server-signed QR proof + attachment integrity + teacher verify endpoint/panel (in progress: signing + verify API + student QR token integration)

### Фаза 3 — Teacher Analytics (1–2 месеци)
Валута на B2B продажба кон училишта.

- [x] **3.1** `features/analytics/itemAnalysis.js` + `features/analytics/TeacherAnalyticsPanel.jsx` — pure psychometrics (p-value, point-biserial, cohort stats, deciles) + teacher dashboard UI интеграција во главен app view.
- [x] **3.2** Bloom класификација (рачно/AI-assisted heuristic) → когнитивни извештаи (coverage + manual override + auto-suggest)
- [x] **3.3** Cohort analysis: одделение во семестар (grade x semester breakdown + trend deltas)
- [x] **3.4** PDF извештаи за родители + училишна администрација (print-ready parent/admin templates + export actions)
- [x] **3.5** Excel/Google Sheets извоз за е-дневници (CSV bundle + Google Sheets clipboard TSV)
- [x] **3.6** RAG quality dashboard: retrieval latency, citation coverage, hallucination sampling, teacher feedback loop (interactive feedback controls)

### Фаза 4 — Authoring 2.0 (паралелно со 2/3)
- [x] **4.1** PDF извоз преку `@react-pdf/renderer` (пиксел-перфект, без browser print)
- [x] **4.2** DOCX извоз преку `docx`
- [x] **4.3** Vision Import (GPT-4o + Tesseract fallback): хартиен тест → JSON
- [x] **4.4** GeoGebra/Desmos embed за интерактивни графички задачи
- [x] **4.5** Question version history (Firestore subcollections); тест-ниво Undo
- [x] **4.6** Collaborative editing (Yjs + Firestore RTDB) — modular CRDT codec + local broadcast sync + RTDB transport adapter + presence metadata + conflict UX indicators + stale presence pruning/activity windows
- [ ] **4.7** AI Co-author (предлага дистрактори, тежина, време)

### Фаза 5 — Content Marketplace (3+ месеци)
- [ ] **5.1** Public library со рејтинг + тагови (предмет/одделение/куркулум)
- [ ] **5.2** Curriculum mapping за МК/АЛ/SR/HR/BG/EU стандарди
- [ ] **5.3** Forking & remix
- [ ] **5.4** Revenue share за топ-наставници

### Фаза 6 — Internationalization & Compliance
- [ ] **6.1** i18next (извади ги стринговите од `translations`)
- [ ] **6.2** Јазици: SR, HR, BG, TR, EN
- [ ] **6.3** GDPR: DPA, право на бришење, EU Firestore region
- [ ] **6.4** WCAG 2.1 AA audit
- [ ] **6.5** SOC 2 Type 1 (self-attestation)
- [ ] **6.6** OneRoster + LTI 1.3 (Canvas, Moodle, Google Classroom)

### Фаза 7 — Differentiation
- [ ] **7.1** STEM-first позиционирање (KaTeX advantage)
- [ ] **7.2** Print-first DNA (70% училишта печатат)
- [ ] **7.3** AI-генериран варијантен тест (анти-препишување)
- [ ] **7.4** Adaptive testing (IRT) — премиум
- [ ] **7.5** Plagiarism / similarity check

---

## 💼 Бизнис-модел

| Слој | Опис | Цена |
|---|---|---|
| Free | До 3 тестови, водомарка | €0 |
| Teacher Pro | Неограничено, analytics, AI import | €5–8/месец |
| School | SSO, admin dashboard, LTI | €2/ученик/година |
| District / Ministry | On-prem, custom curriculum | Enterprise |

**Go-to-market:** МК → АЛ → Балкан → CEE → EU → Global STEM niche.

---

## 🎯 Прв sprint (овој месец) — без компромиси

1. **Tooling setup** (ESLint, Prettier, EditorConfig, Husky, .env.example)
2. **Test infrastructure** (Vitest + RTL)
3. **Modularization round 1:** извади `i18n`, `firebase`, `domain/schema` од `main.jsx`
4. **CI** (GitHub Actions: lint + test + build на secret-аware preview)
5. **Student Mode MVP** прототип (read-only такинг + auto-grade за multiple/true-false/checklist)
6. **RAG pilot** (1 предмет, 1 одделение, 3 наставници): Google Embeddings 2 + retrieval eval + guardrails

---

**Одговорни:** Игор Богданоски (продукт/архитектура) + Zencoder AI (имплементација).
**Журнал на прогрес:** секоја фаза заклучува со tag во git и кратка ретроспектива во овој фајл.
