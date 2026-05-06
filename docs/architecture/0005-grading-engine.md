# ADR-0005: Чист grading engine

**Статус:** Прифатено · 2026-04

## Контекст
Auto-grading е критичен за Phase 2 (Student Mode) и за aналитика во Phase 3.
Логиката мора да биде:
- Деterministic (ист input → ист output).
- Тестабилна без render или Firebase.
- Аудитабилна (tracebacks за зошто 1.5/2 поени).

## Одлука
- `src/features/grading/grade.js` — **PURE** функции без I/O.
- `gradeQuestion(q, response)` враќа стабилен shape:
  `{ earned, max, correct, requiresManual, details? }`.
- `gradeTest(test, responses)` агрегира + дава `percentage` и `requiresManual`.
- Партијален кредит за: `checklist`, `matching`, `ordering`, `statements`,
  `multi-match`, `multi-part`, `selection`.
- Manual оценување за: `essay`, `short-answer`, `fill-blanks`, `list`,
  `diagram`, `table`.
- Македонската скала 1–5 е default (`DEFAULT_GRADING_SCALE`), но може да се
  overrida по училиште (custom rubrics).

## Последици
- 31 тест ја покриваат secured behavior на сите 16 типови.
- Идно: IRT (Item Response Theory) скоринг ќе биде нов модул, не overload на
  овој.
- Детали (`details`) полето ги дава gradebooks материјали за naставник.
