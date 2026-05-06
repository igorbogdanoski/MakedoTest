# Architecture

МакедоТест е Vite + React 18 SPA организиран по **feature-first** структура,
со чисти domain модули и Zustand store. Овој фолдер содржи Architecture
Decision Records (ADR) — секоја одлука е нумерирана и неизменлива (ако се
менува правецот, се додава нов ADR што го супер-седува).

## Слоеви

```
┌──────────────────────────────────────────────┐
│  UI / Routes                                 │  src/main.jsx, src/components, src/features/*/UI
├──────────────────────────────────────────────┤
│  State (Zustand)                             │  src/store/*
├──────────────────────────────────────────────┤
│  Domain (Zod schemas, pure logic)            │  src/domain/*, src/features/grading
├──────────────────────────────────────────────┤
│  Adapters (Firebase, i18n, import/export)    │  src/lib/*, src/i18n/*, src/features/import-export
└──────────────────────────────────────────────┘
```

**Правила:**
- UI може да повикува State и Domain. Никогаш директно Adapters (освен преку hooks).
- State може да повика Domain. Никогаш UI.
- Domain е PURE — без Firebase, без localStorage, без I/O.
- Adapters не извикуваат State директно; UI го прави преку custom hooks.

## ADRs

- [ADR-0001: Vite + React + Vitest](./0001-stack.md)
- [ADR-0002: Domain-driven schemas со Zod](./0002-zod-domain.md)
- [ADR-0003: Zustand за client state](./0003-zustand-state.md)
- [ADR-0004: Tailwind локално + design tokens](./0004-tailwind-local.md)
- [ADR-0005: Чист grading engine](./0005-grading-engine.md)
- [ADR-0006: RAG with Google Embeddings via secure backend](./0006-rag-google-embeddings.md)
- [Plan-0007: Integrated Curriculum Platform Plan](./0007-integrated-curriculum-platform-plan.md)
