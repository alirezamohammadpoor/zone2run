---
name: techdebt
version: 1.0.0
description: Scan for technical debt and suggest DRY refactoring. Use when the user mentions "tech debt," "code cleanup," "refactor," "duplicated code," or at end of sessions to identify improvement opportunities.
---

# Technical Debt Scanner

You are an expert in code quality and refactoring. Your goal is to identify technical debt and provide actionable cleanup recommendations.

## Initial Assessment

Before scanning, understand:

1. **Scope**
   - Full codebase audit or specific directories?
   - Recent changes only or entire project?
   - Focus areas (performance, DRY, types, etc.)?

2. **Project Context**
   - Check CLAUDE.md for architecture patterns
   - Review recent PRs for ongoing work
   - Understand acceptable trade-offs

---

## Scan Categories

### 1. Duplication Detection

**What to Look For:**
- Identical or near-identical components (>80% similarity)
- Copy-pasted hooks or utilities
- Repeated GROQ projection patterns
- Similar UI patterns with small variations

**Thresholds:**
- 3+ instances = Extract to shared component/hook/utility
- 50+ lines = High-priority refactor
- 10-50 lines = Medium-priority refactor

**Real Example** (Zone2Run PR #115):
- `MenContent.tsx` (357 lines) + `WomenContent.tsx` (357 lines) → `GenderMenuContent.tsx` (145 lines)
- Saved 569 lines by extracting gender parameter

### 2. Dead Code

**What to Look For:**
- Unused imports (not referenced in file)
- Unused exports (not imported anywhere)
- Commented-out code blocks
- Orphan files (no imports from other files)
- Unreachable code after returns

**Tools:**
- Use Grep to search for import statements
- Check if exported functions are used elsewhere
- Find files not referenced in any imports

**Real Example** (Zone2Run PR #115):
- Removed `ProductHelper` class (~145 lines, unused)
- Removed `form-data` dependency (not imported anywhere)
- Deleted `FilterBar.tsx`, `menuConfig.ts` (orphan files)

### 3. Type Safety Issues

**What to Look For:**
- `any` types (search for `: any`)
- Missing return types on functions
- Untyped function parameters
- `@ts-ignore` or `@ts-expect-error` comments
- Type assertions (`as Type`) without validation

**Priority:**
- High: Public API functions with `any`
- Medium: Internal utilities with `any`
- Low: One-off type assertions

### 4. Inconsistent Patterns

**What to Look For:**
- Mixed naming conventions (camelCase vs PascalCase)
- Different import styles (default vs named)
- Inconsistent file organization
- Mixed component patterns (memo vs no memo)
- Different error handling approaches

**Check Against:**
- CLAUDE.md conventions
- Dominant pattern in codebase (majority rules)

**Real Example** (Zone2Run PR #115):
- Renamed homepage modules to PascalCase for consistency
- `heroModule.tsx` → `HeroModule.tsx`

### 5. Performance Anti-Patterns

**What to Look For:**
- Components with state that could be CSS-only
- Unnecessary re-renders (missing memo, wrong deps)
- Inline function definitions in render
- Large bundle size (check `next.config.js` `optimizePackageImports`)
- Missing `React.cache()` on repeated server fetches

**Real Examples** (Zone2Run):
- PR #135: ProductCard `useState(isHovered)` → CSS `group-hover` (zero JS)
- PR #96: Duplicate Sanity fetches → `React.cache()` wrapper

### 6. Accessibility Gaps

**What to Look For:**
- Interactive divs without `role`/`tabIndex`
- Missing `alt` text on images
- No keyboard handlers (`onKeyDown`) on custom elements
- Missing ARIA labels on complex UI
- Color contrast issues (if tool available)

**Quick Scan:**
- Search for `<div onClick=` without `role=` or `<button>`
- Search for `<img` without `alt=`
- Check modals for FocusLock

### 7. Documentation Debt

**What to Look For:**
- Complex functions without JSDoc
- Magic numbers without explanation
- Non-obvious algorithms without comments
- README out of sync with code
- CLAUDE.md gaps (check against recent patterns)

---

## Output Format

### Tech Debt Report Structure

**Executive Summary**
- Overall code health score (A-F or 1-10)
- Top 3 priority issues
- Quick wins identified

**Duplication Findings**
For each issue:
- **Location**: Files with duplication
- **Lines**: Approximate size
- **Impact**: High/Medium/Low
- **Recommendation**: Extract to X
- **Effort**: Hours or Story Points

**Dead Code Findings**
Same format as above

**Type Safety Findings**
Same format as above

**Inconsistent Patterns**
Same format as above

**Performance Anti-Patterns**
Same format as above

**Accessibility Gaps**
Same format as above

**Prioritized Action Plan**
1. Critical issues (blocking production/releases)
2. High-impact DRY opportunities (>100 lines saved)
3. Quick wins (easy, immediate benefit)
4. Long-term recommendations

---

## Tools & Techniques

**File Search:**
- Use Glob for pattern matching (`*.tsx`, `**/*.ts`)
- Use Grep for content search (find `"any"`, find unused exports)

**Duplication Detection:**
- Search for similar component names (`LoginForm`, `SignupForm` → `AuthForm`)
- Look for copy-pasted JSDoc comments
- Find repeated GROQ projections

**Dead Code Detection:**
- Grep for `export` statements
- Check if each export is imported elsewhere
- Look for commented-out blocks (`//` or `/* */`)

**Type Scanning:**
- Grep for `: any`
- Grep for `@ts-ignore`
- Check function signatures for missing types

---

## Zone2Run-Specific Patterns

Based on PR #115 (comprehensive audit):

### DRY Opportunities
- Menu content components (Men/Women/Unisex)
- UI primitives (Backdrop, ModalHeader, CollapsibleSection)
- Hooks for common patterns (`useSetToggle`, `useEmblaCarouselDrag`)
- GROQ projections (consolidate in `groqUtils.ts`)

### File Organization
- Extract icons to `components/icons/`
- Extract UI primitives to `components/ui/`
- Move server actions to `lib/actions/`
- Consolidate GROQ in `sanity/lib/groqUtils.ts`

### Naming Conventions
- Components: PascalCase (`HeroModule.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Directories: kebab-case (`menu-modal/`)

---

## Task-Specific Questions

1. What areas of the codebase are most active (recent PRs)?
2. Are there known problem areas to focus on?
3. Is this a pre-release audit or ongoing maintenance?
4. What's the tolerance for breaking changes?
5. Should I prioritize DRY, performance, or types?

---

## Related Skills

- **seo-audit**: For SEO-specific technical debt
- **next-best-practices**: For Next.js patterns
- **vercel-react-best-practices**: For React performance
