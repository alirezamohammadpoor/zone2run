# Git Workflow Rules

## Branch Structure

- `main` - Production branch (protected, releases only)
- `staging` - Integration branch (protected, testing before production)
- `feature/*` - Development branches (created from staging)

## Workflow Rules

### 1. NEVER Push Directly

- **NO direct commits** to `main` or `staging`
- All changes must go through Pull Requests

### 2. Feature Branch Creation

Always start from staging:

```bash
git checkout staging
git pull origin staging
git checkout -b feature/descriptive-name
```

### 3. Development Process

1. Work in your `feature/*` branch locally
2. Commit changes frequently with clear messages
3. Push feature branch to remote when ready

### 4. Integration Flow

```
feature/* → staging → main
```

**Step 1:** Feature to Staging

- Push feature branch: `git push origin feature/your-branch`
- Open PR: `feature/your-branch` → `staging`
- Get approval and merge

**Step 2:** Staging to Main

- After testing on staging
- Open PR: `staging` → `main`
- Deploy to production after merge

## Cursor Commands

### Starting New Work

```bash
# Always start from staging
git checkout staging && git pull origin staging
git checkout -b feature/[task-name]
```

### Pushing Changes

```bash
# Push feature branch
git push origin feature/[task-name]
# Then create PR via GitHub/GitLab UI
```

### Syncing with Latest

```bash
# Update staging and rebase feature
git checkout staging && git pull origin staging
git checkout feature/[task-name]
git rebase staging
```

## Key Reminders

- ✅ Feature branches from staging
- ✅ All merges via PRs only
- ✅ Test on staging before main
- ❌ Never push directly to main/staging
- ❌ Never merge without PR review
