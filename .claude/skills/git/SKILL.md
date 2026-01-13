---
name: git-workflow
description: Guide git operations using a three-tier branching model (main → staging → feature). Use this skill when the user asks about git commands, branch strategy, PRs, rebasing, merging, deploying to production, hotfixes, or conflict resolution. Triggers include "git", "commit", "branch", "PR", "rebase", "merge", "deploy", "staging", "feature branch", "hotfix".
---

# Git Workflow

Three-tier branching: `main` (production) → `staging` (integration) → `feature/*` (development).

## Core Workflow

### Start Feature

```bash
git feature <name>
```

Creates `feature/<name>` from latest staging.

### During Development

```bash
git add -A && git commit -m "WIP: description"
git sync  # daily - rebases on staging
```

### Before PR

```bash
git rebase -i origin/staging     # clean WIP commits
bun build && bun lint          # verify
git push origin feature/xxx --force-with-lease
gh pr create --base staging --title "feat: description"
```

### Merge PR

GitHub → **Squash and merge**

### Deploy to Production

```bash
git checkout main && git pull
git merge staging --ff-only
git push origin main
```

### After Deploy (sync staging)

```bash
git checkout staging && git pull
git merge origin/main --ff-only
git push origin staging
```

## Merge Strategy Rules

| Route             | Method                       | Why                       |
| ----------------- | ---------------------------- | ------------------------- |
| feature → staging | Squash (GitHub PR)           | Clean history             |
| staging → main    | Fast-forward or merge commit | Preserves feature commits |

**Never squash staging → main** — breaks history connection.

## Quick Reference

For detailed commands, see [references/commands.md](references/commands.md):

- Hotfix workflow
- Conflict resolution
- Emergency recovery
- Weekly maintenance

## Conventional Commits

```
type(scope): description
```

**Types:** `feat` `fix` `refactor` `chore` `docs` `test` `perf`

**Scopes:** Project-specific (e.g., `cart`, `api`, `checkout`, `schema`)

## Aliases

| Alias                | Action                 |
| -------------------- | ---------------------- |
| `git sync`           | Rebase on origin       |
| `git feature <name>` | Create feature branch  |
| `git cleanup`        | Delete merged branches |
