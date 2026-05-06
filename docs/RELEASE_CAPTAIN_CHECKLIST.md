# Release Captain Checklist

Use this checklist for every production release.

## Release scope
- [ ] PR URL and title are recorded.
- [ ] Release owner (captain) is assigned.
- [ ] Rollback owner is assigned.

## Pre-release quality gates
Run in this order:

1. `npm run test:critical`
2. `npm run qa:release`

Evidence:
- [ ] Command output attached to PR/release notes.
- [ ] No skipped or muted tests for this release.

## CI and repository checks
- [ ] `Critical Smoke` is green.
- [ ] `Lint, Test, Build (20)` is green.
- [ ] `Lint, Test, Build (22)` is green.
- [ ] Required approvals are complete.
- [ ] Code Owners review is complete.

## Runtime readiness
- [ ] Required Firebase env/secrets are configured.
- [ ] Functions runtime target is Node 22.
- [ ] RAG API base URL is correct for target environment.

## Deployment and smoke
- [ ] Deploy completed without errors.
- [ ] App opens and editor loads.
- [ ] StudentTake critical flow works.
- [ ] RAG refresh and insert hints flow works.
- [ ] Build artifact is archived.

## Rollback plan
- [ ] Previous stable commit/tag is identified.
- [ ] Rollback command path is prepared.
- [ ] Incident contact channel is ready.

## Sign-off
- [ ] Captain sign-off
- [ ] Technical sign-off
- [ ] Product/teacher sign-off

## If blocked
1. Stop release.
2. Open issue: `release: blocker <short-title>`.
3. Link failing check and exact command output.
4. Follow incident process in `docs/NO_MERGE_POLICY.md`.
