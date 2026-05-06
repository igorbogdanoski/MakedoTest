# ADR-0002: Domain-driven schemas со Zod

**Статус:** Прифатено · 2026-04

## Контекст
Прашањата (16 типови) се читаат од: рачен унос, AI генерирано (GPT-4o, Claude,
Gemini), JSON paste, QTI XML и Vision OCR (идно). Без runtime валидација,
секој извор е потенцијален вектор за crash или data corruption.

## Одлука
- Сите типови прашања (`multiple`, `true-false`, ..., `section`) имаат Zod
  schema во `src/domain/schema.js`.
- Дискриминирана унија `QuestionSchema` врз поле `type`.
- Целиот Test модел (`TestSchema`) ги опфаќа метаподатоците (наслов, предмет,
  одделение, јазик) + низа од прашања.
- Помошни функции `parseQuestionList(input)` и `parseTest(input)` враќаат
  `{ success, data | error }` (Zod safeParse pattern).

## Правила
- **Никаде во UI или State** не се прифаќа `unknown` JSON без валидација.
- Сите import-export патеки минуваат низ овие парсери.
- Идна TypeScript миграција: `z.infer<typeof QuestionSchema>` ќе биде sole
  source of truth за статични типови.

## Последици
- Малку повеќе boilerplate (worth it за безбедност).
- AI промптот во `AI_IMPORT_PROMPT.md` мора да остане синхрон со схемата
  (видливо несовпаѓање ќе се фати од Zod, не во production).
