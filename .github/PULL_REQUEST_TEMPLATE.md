## Summary
<!-- Што се менува и зошто. Поврзи issue/задача. -->

## Што е променето
- [ ] Логика на прашања / scoring
- [ ] UI / accessibility
- [ ] Print layout (А4)
- [ ] Import / export (JSON, QTI, AI)
- [ ] Firebase / auth / data модел
- [ ] Build / tooling / CI
- [ ] Документација

## Како е тестирано
<!-- Команди, скриншоти, чекори за рачно тестирање. -->

- [ ] `npm run test:critical`
- [ ] `npm run qa:release` (за release/infra PR)
- [ ] `npm test`
- [ ] `npm --prefix functions test` (ако има functions промени)
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual smoke (editor → preview → print)

## Скриншоти
<!-- Особено за print layout и STEM рендерирање. -->

## Checklist
- [ ] `Critical Smoke` check е зелен во CI
- [ ] `Lint, Test, Build (20)` check е зелен во CI
- [ ] `Lint, Test, Build (22)` check е зелен во CI
- [ ] Нови стрингови додадени во `src/i18n/translations.js` (mk + sq)
- [ ] AI/JSON импорти валидирани преку `parseQuestionList` / `parseTest`
- [ ] Нема commit-нати тајни (`.env`, API клучеви)
- [ ] Промените на `src/domain/schema.js` имаат тестови

## Blocker / Incident Notes
<!-- Ако нешто е паднато во CI, опиши root cause и remediation чекор пред merge. -->
