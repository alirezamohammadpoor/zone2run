---
name: sync-staging
description: Sync staging with main after a production deploy. Use after merging staging into main to fast-forward staging to match. Triggers on "sync staging", "sync-staging", "update staging from main", "post-deploy sync".
---

# Sync Staging with Main

After deploying staging to main, sync staging back to match main.

## Steps

Run the following commands sequentially:

```bash
git checkout staging && git pull origin staging
git merge origin/main --ff-only
git push origin staging
```

## Rules

- **Must be fast-forward only** — if `--ff-only` fails, staging has diverged from main. Do NOT force merge. Alert the user.
- Always pull staging first to ensure local is up to date.
- Verify with `git log --oneline -3 staging` after push to confirm sync.
