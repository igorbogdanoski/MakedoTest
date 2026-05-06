# Branch Protection Audit Checklist

Use this checklist to verify GitHub enforcement matches repository quality policy.

## Scope
- Repository: `igorbogdanoski/MakedoTest`
- Branch: `main`
- Audit cadence: before each release and monthly

## Ruleset Checks
- [ ] Pull requests are required for `main`.
- [ ] At least 1 approval is required.
- [ ] Code Owners review is required.
- [ ] Stale approvals are dismissed on new commits.
- [ ] Branch must be up to date before merge.
- [ ] Required status checks are configured.

## Required Status Checks
- [ ] `Critical Smoke`
- [ ] `Lint, Test, Build (20)`
- [ ] `Lint, Test, Build (22)`

## Repository Files Check
- [ ] `.github/CODEOWNERS` exists and points to active maintainers.
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` includes CI and incident checklist.
- [ ] `docs/NO_MERGE_POLICY.md` is present and current.
- [ ] `docs/GITHUB_RULESET_RECOMMENDATION.md` matches actual settings.

## Local Command Evidence
Run and attach output in release notes or PR:

```bash
npm run test:critical
npm run qa:release
```

## Audit Result
- [ ] PASS: all controls active
- [ ] FAIL: at least one control missing (open issue immediately)

## If FAIL
1. Open issue title: `governance: restore branch protection controls`.
2. Link missing controls and screenshots.
3. Block release until issue is closed.
