# ADR-0004: Tailwind локално + design tokens

**Статус:** Прифатено · 2026-04

## Контекст
Tailwind беше вчитуван од `cdn.tailwindcss.com` — непрепорачано за production
(нема purge, JIT работи во browser, кешира лошо, runtime cost).

## Одлука
- Tailwind 3.x локално преку PostCSS (`postcss.config.js`).
- `tailwind.config.js` содржи **design tokens** (бои `brand`, `accent`, `ink`;
  типографија `Inter`; spacing `a4w`/`a4h` за А4 print; shadows).
- `src/styles/index.css` ги декларира `@tailwind base/components/utilities`
  + `@layer components` за shared класи (`.btn-primary`, `.card`, `.btn-ghost`).
- Print-only CSS живее во истиот фајл под `@media print`.

## Правила
- **Не** менувај бои inline (`bg-[#xxxxxx]`) — додај токен во конфиг.
- **Не** дупли CSS — користи `@apply` во `index.css` ако треба shared.
- **Не** додавај втор @import за Tailwind во компоненти.

## Последици
- ~37 KB css bundle (gzip ~6.6 KB) — multiплекс помал од CDN.
- Можност за тема (dark mode) во иднина без runtime cost.
