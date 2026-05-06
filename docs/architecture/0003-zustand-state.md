# ADR-0003: Zustand за client state

**Статус:** Прифатено · 2026-04

## Контекст
Сегашниот `main.jsx` држи се state локално (`useState`-ovi во App). Тоа го
прави UI единствен извор на вистина и оневозможува: студентско take view да
ги препрочита истите модели, тестирање без да се mount-нува цел app, и
share state помеѓу sibling компоненти.

## Одлука
- **Zustand 4.x** како единствен store (`src/store/testStore.js`).
- Store содржи само domain state — никаков UI state (modals, sidebar итн.
  остануваат локални).
- Сите мутации се преку **actions** во самиот store; компонентите никогаш
  директно не повикуваат `setState`.
- Selectors треба да се користат за оптимизирани subscription-и.
- Persistence (localStorage / Firestore sync) е middleware (идно), не во
  основниот store.

## Последици
- Тестирање = `useTestStore.getState()` без render.
- Лесен undo / time-travel со `zundo` middleware (идно).
- Никогаш не правиме circular dependency Store ↔ Component.
