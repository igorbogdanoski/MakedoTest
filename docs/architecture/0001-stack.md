# ADR-0001: Vite + React 18 + Vitest

**Статус:** Прифатено · 2026-04

## Контекст
Постојниот стек беше Vite + React 18 + Tailwind (CDN). Немаше тест runner,
linter ниту тип-чекер. За да скалираме до светска платформа, потребна е
конзистентна и одржлива основа.

## Одлука
- **Vite 5** како build/dev сервер.
- **React 18** со функциски компоненти и hooks.
- **Vitest 2.x** + **@testing-library/react** за unit/integration тестови.
- **ESLint 8** + **Prettier 3** за стил.
- **Node 20/22** како подржани runtime во CI.
- TypeScript ќе се воведе постепено (ADR-XXXX, идно).

## Последици
- Сите контрибутори мораат да поминат `lint + test + build` пред merge.
- Vitest 2.x е задолжителен (1.x не работи на Node 24).
- Тестовите се co-located со кодот: `foo.js` + `foo.test.js`.
