# Local Hooks Troubleshooting (Windows, Git Bash, WSL)

This guide helps when Husky hooks do not run as expected.

## Expected local hooks
- `.husky/pre-commit` -> runs `npm run lint-staged`
- `.husky/pre-push` -> runs `npm run test:critical`

## Quick verification
1. Run `npm run lint-staged` (with staged files).
2. Run `npm run test:critical`.
3. Check hooks exist in `.husky/`.

## Windows notes
1. Use Git Bash or WSL for Git operations when possible.
2. In PowerShell, `sh` may not exist. This is expected.
3. Hooks still run through Git if Git is installed with shell support.

## If hooks are not firing
1. Ensure Husky is installed: `npm run prepare`.
2. Ensure `.git/hooks` points to Husky hooks (re-run `npm run prepare`).
3. Ensure hook files are executable in git metadata:
   - `git add --chmod=+x .husky/pre-commit`
   - `git add --chmod=+x .husky/pre-push`
4. Ensure Git hooks are enabled:
   - `git config core.hooksPath .husky`

## If pre-commit fails unexpectedly
1. Check staged files content and rerun `npm run lint-staged`.
2. Fix lint/format errors and retry commit.
3. Avoid bypassing with `--no-verify` except for emergency hotfixes.

## If pre-push fails unexpectedly
1. Rerun `npm run test:critical`.
2. Fix failing smoke tests first (`StudentTake` and `Question` RAG flow).
3. Push only after green local run.

## Emergency policy
- Do not disable hooks globally.
- If a hook is flaky, open an issue and document exact command/output.
- Follow incident process in `docs/NO_MERGE_POLICY.md`.
