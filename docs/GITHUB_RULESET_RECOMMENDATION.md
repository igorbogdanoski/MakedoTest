# GitHub Ruleset Recommendation (main)

## Goal
Lock quality gates so critical flows cannot be merged in a degraded state.

## Target
- Branch: `main`
- Applies to: direct pushes and pull requests

## Required Settings
1. Require a pull request before merging.
2. Require approvals: at least 1.
3. Require review from Code Owners.
4. Dismiss stale approvals when new commits are pushed.
5. Require branches to be up to date before merging.
6. Require status checks to pass.

## Required Status Checks
- `Critical Smoke`
- `Lint, Test, Build (20)`
- `Lint, Test, Build (22)`

## Optional Hardening
1. Restrict who can push to `main`.
2. Block force pushes.
3. Block branch deletion.
4. Require conversation resolution before merge.

## Operational Notes
- If `Critical Smoke` fails, treat as release blocker and follow `docs/NO_MERGE_POLICY.md`.
- If only one matrix lane fails, fix compatibility before merge; do not bypass checks.
