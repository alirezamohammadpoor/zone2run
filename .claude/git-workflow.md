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

### 3. Integration Flow

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

---

## Commit Message Conventions

Use conventional commit format:

```
<type>: <short description>
```

### Types

| Type | Use For |
|------|---------|
| `feat` | New features |
| `fix` | Bug fixes |
| `refactor` | Code restructuring (no behavior change) |
| `style` | Formatting, CSS changes |
| `docs` | Documentation only |
| `chore` | Dependencies, config, build |

### Examples

```bash
feat: add responsive breakpoints to hero module
fix: content module not rendering media-with-products
refactor: modularize getData.ts into domain-specific files
```

---

## Zone2Run-Specific Rules

### After Sanity Schema Changes

Always regenerate types:

```bash
pnpm typegen
```

### Vercel Preview Deployments

- Every PR gets a preview URL automatically
- Test responsive designs on preview before merging

### Files to Never Commit

- `.env` / `.env.local`
- `node_modules/`
- `.vercel/`

---

## Common Commands

```bash
# Start new work
git checkout staging && git pull origin staging
git checkout -b feature/[task-name]

# Push changes
git push origin feature/[task-name]

# Sync with latest
git checkout staging && git pull origin staging
git checkout feature/[task-name]
git rebase staging
```

---

## PR Guidelines

### Title Format

```
feat: add dark mode toggle to settings
```

### Test Checklist

- [ ] Mobile (375px)
- [ ] Tablet (768px, 1024px)
- [ ] Desktop (1280px+)
- [ ] No TypeScript errors (`pnpm tsc`)
