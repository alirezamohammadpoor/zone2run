# Git Commands Reference

## Hotfix Workflow

Emergency fixes go directly to main, then sync to staging.

```bash
git checkout main && git pull
git checkout -b hotfix/description
# fix, commit
git push origin hotfix/xxx
# PR to main, merge
git checkout staging && git merge origin/main
git push origin staging
```

## Conflict Resolution During Rebase

```bash
# when rebase pauses on conflict:
# 1. edit conflicted files
git add .
pnpm build && pnpm lint   # verify before continue
git rebase --continue

# if >5 files or too complex:
git rebase --abort
```

## Emergency Recovery

```bash
git reflog                        # find lost commits
git reset --hard <hash>           # recover state
git push origin branch --force-with-lease
```

## Weekly Maintenance

```bash
git cleanup   # deletes merged local branches
```

## Staging → Main Options

### Option 1: CLI Fast-Forward (quick deploys)

```bash
git checkout main && git pull
git merge staging --ff-only
git push origin main
```

Fastest. No extra merge commit. Use for routine deploys.

### Option 2: GitHub PR (audit trail)

```bash
gh pr create --base main --head staging --title "Release: v1.x.0"
# Select "Create a merge commit" (NOT squash!)
```

CI runs before merge. Audit trail. Individual commits visible in main.

## Full Command Reference

### Starting a Feature

| Command           | What it does                                 |
| ----------------- | -------------------------------------------- |
| `git feature <n>` | Checkout staging, pull, create `feature/<n>` |

### During Development

| Command                     | What it does              |
| --------------------------- | ------------------------- |
| `git add -A`                | Stage all changes         |
| `git commit -m "WIP: desc"` | Save work locally         |
| `git sync`                  | Fetch + rebase on staging |

### Before PR

| Command                                            | What it does                     |
| -------------------------------------------------- | -------------------------------- |
| `git rebase -i origin/staging`                     | Squash/clean WIP commits         |
| `pnpm build && pnpm lint`                          | Verify after rebase              |
| `git push origin feature/xxx --force-with-lease`   | Push (force needed after rebase) |
| `gh pr create --base staging --title "feat: desc"` | Create PR                        |

### Deploy

| Command                         | What it does            |
| ------------------------------- | ----------------------- |
| `git checkout main && git pull` | Get latest main         |
| `git merge staging --ff-only`   | Fast-forward to staging |
| `git push origin main`          | Push to production      |

### After Deploy

| Command                            | What it does       |
| ---------------------------------- | ------------------ |
| `git checkout staging && git pull` | Get latest staging |
| `git merge origin/main --ff-only`  | Sync with main     |
| `git push origin staging`          | Complete sync      |
