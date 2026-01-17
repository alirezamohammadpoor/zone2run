# Git Commands Reference

## Starting a Feature

| Command              | What it does                                         | When to run          |
| -------------------- | ---------------------------------------------------- | -------------------- |
| `git feature <name>` | Checks out staging, pulls latest, creates `feature/<name>` | Start of any new work |

## During Development

| Command                        | What it does                                | When to run                           |
| ------------------------------ | ------------------------------------------- | ------------------------------------- |
| `git add -A`                   | Stages all changes                          | Before every commit                   |
| `git commit -m "WIP: desc"`    | Saves your work locally                     | Frequently during development         |
| `git sync`                     | Fetches origin + rebases on latest staging  | Daily, or when staging gets new PRs   |
| `git pull`                     | Same as sync (auto-rebases due to config)   | Alternative to `git sync`             |

## Before PR

| Command                                          | What it does                       | When to run                |
| ------------------------------------------------ | ---------------------------------- | -------------------------- |
| `git rebase -i origin/staging`                   | Squash/clean WIP commits           | Before opening PR (optional) |
| `bun build && bun lint`                          | Verify after rebase                | After rebase, before push  |
| `git push origin feature/xxx --force-with-lease` | Push (force needed after rebase)   | After cleaning commits     |
| `gh pr create --base staging --title "feat: desc"` | Create PR to staging             | Once pushed                |

## Merge PR (GitHub)

| Action                      | What it does                      | When to run          |
| --------------------------- | --------------------------------- | -------------------- |
| Click **"Squash and merge"** | Consolidates all commits into one | When PR is approved  |

## Deploy to Production

| Step | Command/Action                                                           | What it does                       |
| ---- | ------------------------------------------------------------------------ | ---------------------------------- |
| 1    | Update `version` in `package.json`                                       | Bump version (e.g., 2.8.0 → 2.8.1) |
| 2    | `git add package.json && git commit -m "chore: bump version to vX.X.X"`  | Commit version bump                |
| 3    | `git push origin staging`                                                | Push to staging                    |
| 4    | `gh pr create --base main --head staging --title "Release: vX.X.X"`      | Create release PR                  |
| 5    | Select **"Create a merge commit"** (NOT squash!)                         | Preserves commit history           |

> **Why PR instead of CLI merge?** CI runs before merge. Audit trail. Safer for production.

## After Deploy (Critical!)

| Command                            | What it does           | When to run        |
| ---------------------------------- | ---------------------- | ------------------ |
| `git checkout staging && git pull` | Get latest staging     | After main push    |
| `git merge origin/main --ff-only`  | Sync with main         | Keeps branches identical |
| `git push origin staging`          | Complete sync          | Completes sync     |

> **Note:** GitHub is configured to NOT delete staging after merge (`delete_branch_on_merge: false`).

## Weekly Maintenance

| Command       | What it does                  | When to run |
| ------------- | ----------------------------- | ----------- |
| `git cleanup` | Deletes merged local branches | Weekly      |

## Hotfix (Emergency)

| Command                                          | What it does         | When to run            |
| ------------------------------------------------ | -------------------- | ---------------------- |
| `git checkout main && git pull`                  | Start from production | Emergency fix needed   |
| `git checkout -b hotfix/description`             | Create hotfix branch  | After checkout main    |
| `git commit -m "fix: description"`               | Commit the fix        | After fixing           |
| `git push origin hotfix/xxx`                     | Push for PR           | Ready for review       |
| Merge PR to main (GitHub)                        | Deploy hotfix         | After approval         |
| `git checkout staging && git merge origin/main`  | Sync staging          | Immediately after      |

## Conflicts During Rebase

| Command                 | What it does               | When to run                  |
| ----------------------- | -------------------------- | ---------------------------- |
| Edit conflicted files   | Resolve conflicts manually | When rebase pauses           |
| `git add .`             | Mark conflicts resolved    | After fixing files           |
| `bun build && bun lint` | Verify nothing broke       | Before continuing            |
| `git rebase --continue` | Resume rebase              | After verification           |
| `git rebase --abort`    | Cancel rebase entirely     | If >5 files or too complex   |

## Emergency Recovery

| Command                                     | What it does                    | When to run           |
| ------------------------------------------- | ------------------------------- | --------------------- |
| `git reflog`                                | Shows all recent HEAD positions | Find lost commits     |
| `git reset --hard <hash>`                   | Resets to specific commit       | Recover from mistakes |
| `git push origin branch --force-with-lease` | Force push safely               | After recovery        |

## Aliases

| Alias                 | Command                              |
| --------------------- | ------------------------------------ |
| `git sync`            | Rebase current branch on origin      |
| `git feature <name>`  | Create feature branch from staging   |
| `git cleanup`         | Delete merged local branches         |

## Conventional Commits

| Type       | Use for                              |
| ---------- | ------------------------------------ |
| `feat`     | New feature                          |
| `fix`      | Bug fix                              |
| `refactor` | Code restructure (no behavior change) |
| `chore`    | Maintenance, deps, config            |
| `docs`     | Documentation                        |
| `test`     | Tests                                |
| `perf`     | Performance improvement              |
| `a11y`     | Accessibility improvement            |

| Scope      | Area              |
| ---------- | ----------------- |
| `images`   | Image handling    |
| `cart`     | Cart functionality |
| `api`      | API routes        |
| `checkout` | Checkout flow     |
| `schema`   | Sanity schemas    |
| `header`   | Header component  |

**Format:**

```
type(scope): description (max 72 chars, imperative)
```

**Examples:**

```
feat(cart): add quantity selector to cart drawer
fix(images): resolve aspect ratio on mobile
refactor(api): extract Sanity queries to separate file
a11y: WCAG 2.1 AA compliance round 4
```

## Quick Reference

| Route              | Method        | Why                                  |
| ------------------ | ------------- | ------------------------------------ |
| feature → staging  | Squash merge  | Clean history, one commit per feature |
| staging → main     | Merge commit  | Preserves history connection          |

**Never squash staging → main**