# No-Merge Policy & Incident Playbook

## Policy (main branch)
- Нема merge ако не е зелен `Critical Smoke`.
- Нема merge ако не е зелен `Lint, Test, Build (20)`.
- Нема merge ако не е зелен `Lint, Test, Build (22)`.
- Нема bypass освен за production incident со одобрување од сопственик на репо.

## Incident Handling

### 1) `Critical Smoke` е паднат
- Третирај како P0 (release blocker).
- Локално репродуцирај со `npm run test:critical`.
- Ако fail е во `StudentTake`: провери `act(...)` warning, keyboard a11y flow, draft persistence.
- Ако fail е во `Question` RAG smoke: провери `Освежи`/`Вметни насоки` flow и RAG feature flag state.
- Отвори fix PR со наслов `fix(ci): restore critical smoke`.
- Merge се дозволува само по green rerun.

### 2) `Lint, Test, Build (20)` е паднат
- Провери Node 20 compatibility и frontend toolchain regression.
- Локално: `npm test`, `npm run lint`, `npm run build`.
- Ако е flaky тест, стабилизирај тест (не mute-ирај assertion).

### 3) `Lint, Test, Build (22)` е паднат
- Провери Node 22 runtime path, особено `functions` dependencies.
- Локално: `npm --prefix functions test` + frontend checks.
- Ако има runtime/deprecation warning со ризик, третирај како P1 до целосно расчистување.

## Rollback Rule
- Ако фиксот не е јасен во 30 минути за `Critical Smoke`, направи revert на последниот сомнителен PR и отвори follow-up issue.

## Evidence Rule
- Секој fix PR мора да содржи:
  - краток root cause,
  - точни команди што се извршени,
  - потврда дека трите required checks се зелени.