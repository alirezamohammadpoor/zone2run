# Dev Journal

---

# 16 Jan 2026

## WCAG 2.1 AA Compliance + v2.8.0 Release

**Round 4 Fixes (RAMS Review)**

- CollapsibleSection: `aria-expanded`, `aria-controls`, `aria-hidden` accordion pattern
- SortModal: Added `inert` attribute to prevent keyboard trap
- MenuModal: Tablist ARIA pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
- ProductCardGallery: 44x44px touch targets on navigation arrows
- Header: Cart button `aria-label` with item count
- heroModule: Meaningful alt fallback chain

**Release Process**

- Bumped version 2.7.0 → 2.8.0
- PR #86: staging → main (merge commit, not squash)
- Configured `delete_branch_on_merge: false` on GitHub
- Updated git cheat sheet with PR-based deploy workflow

**Results**

- RAMS score: 82 → 90+
- All modals have `inert` + FocusLock
- Touch targets meet WCAG 2.5.5

**Key Learnings**

- `inert={!isOpen ? true : undefined}` not `inert={!isOpen}` (React expects `true` or `undefined`)
- Tablist pattern: each `role="tab"` needs `aria-selected`, `aria-controls`, `id`
- Always-render hidden content with CSS (`hidden` class) for better screen reader support
- Deploy via PR (not CLI merge) for audit trail + CI verification

---

# 15 Jan 2026

## WCAG 2.1 AA Accessibility Push (Rounds 1-3)

**Modal Accessibility**

- `inert` attribute on CartModal, MenuModal, AddedToCartModal when closed
- FocusLock (`react-focus-lock`) for keyboard trap prevention
- Auto-focus first focusable element on open
- Return focus to trigger on close
- Escape key handlers across all modals

**Keyboard Navigation**

- Arrow keys for product gallery navigation
- Tab order audit across all interactive elements
- Skip link to main content

**Screen Reader Support**

- `aria-live` regions for dynamic content announcements
- Proper heading hierarchy (h1 → h2 → h3)
- Meaningful image alt text (fallback chains, not empty strings)

**Form Accessibility**

- `<fieldset>` + `<legend>` for radio groups (SortButtons)
- `aria-pressed` for toggle buttons (FilterButtons)
- Associated labels for all inputs

**Touch Targets**

- Filter/sort buttons: `min-w-[44px] min-h-[44px]`
- Focus rings: `focus:ring-2 focus:ring-black focus:ring-offset-2`

**Results**

- RAMS score: ~60 → 82
- 42 files changed across release

**Key Learnings**

- Always-render pattern > conditional render for modals (screen readers need DOM presence)
- `inert` is the modern replacement for `aria-hidden` + `tabindex="-1"` hacks
- FocusLock + inert together = bulletproof keyboard trap prevention
- WCAG 2.5.5 requires 44x44px, not 24x24px

---

# 08 Jan 2026

## ISR + Performance Push

**ISR Implementation**

- On-demand revalidation via Sanity webhooks (fixed nested slug handling)
- Moved `draftMode()` to client component for edge caching
- Added explicit cache headers to all Sanity fetch functions (Next.js 15 default changed)
- Implemented `generateStaticParams` for product pages (required for ISR on dynamic routes)

**LCP Optimizations**

- Priority loading on first 4 products (desktop) / 2 (mobile): `fetchPriority="high"` + `loading="eager"`
- Added LQIP blur placeholders to brand editorial images
- Preconnect to `cdn.sanity.io` (needs `crossOrigin` attribute)

**Mega Menu UX**

- Restructured desktop: 3-column layout (Clothing | Footwear | Accessories)
- Black text, gray hover states
- Added "View All Editorials" link to Our Space section

**Results**

- Desktop: ~90 → 100
- Mobile: ~85 → 95+
- Brand page LCP: 4.1s → 2.4s
- PDP: 94

**Key Learnings**

- Next.js 15 requires explicit `fetch` cache config for ISR
- `generateStaticParams` mandatory for dynamic route ISR
- `draftMode()` breaks edge caching—must be client-side
- LQIP available via `asset->metadata.lqip`
