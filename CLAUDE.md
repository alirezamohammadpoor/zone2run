# Zone2Run

Premium headless e-commerce for running apparel. Sanity CMS + Shopify + Next.js.

**Market**: Scandinavian | **Currency**: SEK | **VAT**: 25% included

**Production URL**: https://zone2run-build.vercel.app

---

## Tech Stack

| Tech     | Version                | Role                          |
| -------- | ---------------------- | ----------------------------- |
| Next.js  | 16.0.7                 | App Router, Server Components |
| React    | 19.2.1                 | UI                            |
| Sanity   | 4.10.1                 | CMS, Visual editing           |
| Shopify  | Storefront API 2024-01 | Commerce backend              |
| Zustand  | 5.0.6                  | Client state (cart)           |
| Tailwind | 3.4.17                 | Styling                       |
| Bun      | -                      | Package manager               |

---

## Architecture

```
Shopify → Webhooks → Sanity → GROQ → Next.js → Browser
                                           ↓
                                    Shopify Checkout
```

- **Shopify**: inventory, pricing, checkout
- **Sanity**: enriched content, editorial, images
- **Next.js**: SSR/ISR, image optimization
- **Webhooks**: auto-sync products/collections

---

## Commands

```bash
bun dev              # Dev server (localhost:3000)
bun build            # Production build
bun build:analyze    # Bundle analysis
bun lint             # ESLint
bun typegen          # Regenerate Sanity types (REQUIRED after schema changes)
```

---

## Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (main)/               # Main layout group
│   │   ├── page.tsx          # Homepage
│   │   ├── products/[handle] # Product pages
│   │   ├── mens/[...path]    # 3-level category routes
│   │   ├── womens/[...path]
│   │   ├── brands/[slug]
│   │   └── blog/
│   ├── (studio)/studio/      # Sanity Studio
│   └── api/
│       ├── shopify-product-webhook/  # Main sync webhook
│       ├── draft/            # Enable preview
│       └── revalidate/       # ISR trigger
│
├── components/
│   ├── Header.tsx            # Client nav (uses HeaderServer.tsx wrapper)
│   ├── ProductCard.tsx       # Memoized product card
│   ├── CartModal.tsx         # Slide-out cart
│   ├── homepage/             # Modular homepage components
│   ├── product/              # PDP components
│   ├── menumodal/            # Mobile nav
│   └── skeletons/            # Loading states
│
├── sanity/
│   ├── lib/                  # Data fetching
│   │   ├── client.ts         # Sanity clients (published + preview)
│   │   ├── getData.ts        # Barrel exports
│   │   ├── getProducts.ts    # Product queries
│   │   ├── groqUtils.ts      # Shared GROQ projections
│   │   └── get*.ts           # Domain-specific queries
│   └── schemaTypes/          # Sanity schemas
│       ├── product.ts
│       ├── brand.ts
│       ├── category.ts       # 3-level hierarchy
│       ├── homepage/         # Module schemas
│       └── documents/        # Document types
│
├── lib/
│   ├── cart/store.ts         # Zustand cart (localStorage persist)
│   ├── shopify/              # Shopify GraphQL
│   ├── webhook/              # Webhook processors (modularized)
│   │   ├── productProcessor.ts
│   │   ├── brandMatcher.ts
│   │   └── deduplication.ts
│   └── utils/
│
├── types/                    # TypeScript definitions
└── hooks/                    # Custom hooks
```

---

## Key Patterns

### Server vs Client Components

```typescript
// DEFAULT: Server Component
async function ProductPage({ params }) {
  const product = await getProductByHandle(params.handle);
  return <ProductInfo product={product} />;
}

// CLIENT: Add directive when needed
"use client";
function AddToCart() {
  const { addItem } = useCartStore();
  return <button onClick={() => addItem(...)}>Add</button>;
}
```

### Data Fetching

All in `src/sanity/lib/`. Use barrel export:

```typescript
import { getSanityProductByHandle } from "@/sanity/lib/getData";
```

GROQ projections shared via `groqUtils.ts`.

### Cart (Zustand)

```typescript
const { items, addItem, checkout } = useCartStore();
// Optimistic updates → background Shopify sync
// Persists to localStorage ("cart-storage")
```

### Loading States

Every route has `loading.tsx` with skeleton:

```typescript
// src/app/products/[handle]/loading.tsx
export default function Loading() {
  return <ProductDetailsSkeleton />;
}
```

---

## Category System

3-level hierarchy:

```
Gender → Main → Sub → Specific
/mens/clothing/tops/t-shirts
```

Auto-assigned via webhook from Shopify `productType`.

---

## Homepage Modules

Swappable versions with modular blocks:

- `heroModule` - Video/image + CTA
- `featuredProductsModule` - Product grid
- `editorialModule` - Blog carousel
- `imageModule` - Full-width media
- `portableTextModule` - Flexible content (4 layouts)
- `spotifyPlaylistsModule` - Playlist embeds

---

## Webhook System

`/api/shopify-product-webhook` → modularized in `src/lib/webhook/`

Processing:

1. Validate signature
2. Deduplicate (5-min in-memory cache)
3. Extract: gender, category, brand
4. Process images → upload to Sanity
5. Create/update documents
6. Trigger ISR revalidation

---

## Environment Variables

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_READ_TOKEN          # Server only

# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
SHOPIFY_ADMIN_API_TOKEN        # Server only

# Site
NEXT_PUBLIC_SITE_URL
SANITY_PREVIEW_SECRET
SANITY_REVALIDATE_SECRET
```

---

## Naming Conventions

| Type           | Convention | Example           |
| -------------- | ---------- | ----------------- |
| Components     | PascalCase | `ProductCard.tsx` |
| Utilities      | camelCase  | `formatPrice.ts`  |
| Directories    | kebab-case | `menu-modal/`     |
| Sanity schemas | camelCase  | `heroModule.ts`   |

---

## Gotchas

1. **`bun typegen`** - Run after ANY Sanity schema change
2. **Webhook dedup is in-memory** - Doesn't survive deploys. Consider Redis for scale.
3. **Cart optimistic updates** - UI updates instantly, Shopify sync is background. Silent failures possible.
4. **Gender mapping** - URL `/mens/` maps to DB value `"mens"` (note the 's')
5. **Image optimization disabled in dev** - `unoptimized: true` in dev mode
6. **31-day image cache** - New images show immediately (new URLs). Replaced images cached for 31 days.
7. **Server Components by default** - Only add `"use client"` when needed
8. **loading.tsx for loading states** - Not spinners in components
9. **Don't add "Claude Code" in commits or PRs**

---

## Common Tasks

### Add Homepage Module

1. Schema in `src/sanity/schemaTypes/homepage/`
2. Register in `schemaTypes/index.ts`
3. Add to `homepageVersion.ts` modules array
4. Component in `src/components/homepage/`
5. Add to switch in `HomePageSanity.tsx`
6. Run `bun typegen`

### Add Product Field

1. Update `src/sanity/schemaTypes/product.ts`
2. Update webhook if Shopify-synced
3. Update projection in `groqUtils.ts`
4. Run `bun typegen`

### Debug Sync Issues

1. Check Vercel logs → Functions → shopify-product-webhook
2. Check Sanity Studio → Vision tool
3. Manual re-sync: `curl -X POST yoursite.com/api/sync-existing-products`

---

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

---

## Git Workflow

`feature/*` → `staging` → `main`

### Commit Message Format

Type prefix required:
- `feat:` - New features, major additions
- `perf:` - Performance optimizations
- `fix:` - Bug fixes, edge cases
- `refactor:` - Code cleanup, DRY
- `chore:` - Version bumps, deps
- `a11y+perf:` - Combined accessibility + performance

**Format**: `type: short description (#PR)`

Examples from real commits:
```
feat: comprehensive SEO audit fixes (#139)
perf: lazy-load Embla carousel + fix image sizes delivery (#128)
refactor: dead code removal, dedup utilities, consistency fixes (#134)
fix: cart checkout improvements and OOS detection (#112)
```

**Never**:
- Use emojis
- Add "Claude Code" attribution
- Skip type prefix

### Feature Branch

```bash
git checkout -b feature/description staging
```

- One focused feature per PR
- Commit with type prefix
- Push and create PR to staging

### PR Body Structure

Based on successful PRs (#135, #126, #121):

```markdown
## Summary
- Bullet points with **bold key features**
- Technical details in one-liners
- Bug fix callouts inline
- File count: "14 files changed, 1 new file"
- Build status: "Build passes ✓"

## Test plan
- [X] Feature-specific tests
- [X] Edge cases
- [X] Category page loads
- [X] `bun build` passes (always last item)
```

### Staging → Main

1. Bump version in `package.json` (semantic versioning)
2. Commit: `chore: bump version to X.Y.Z`
3. Create PR with release notes summarizing included PRs
4. Title format: `v2.12.0: SEO audit fixes` (version + key feature)

**Never**:
- Squash staging → main (preserves history)
- Force push to main/staging

---

## Code Organization

Modularization pattern from PR #115 (webhook/):

```
module/
├── index.ts           # Barrel exports
├── types.ts           # Shared types
├── processor1.ts      # Domain logic
├── processor2.ts      # Domain logic
├── utilities.ts       # Shared utilities
└── logger.ts          # Optional logging
```

**Benefits**:
- Single import point: `import { fn } from "@/lib/module"`
- Clear separation of concerns
- Easy to test individual processors
- Prevents circular dependencies

**Example** (webhook module):
- `productProcessor.ts` - Shopify product sync logic
- `collectionProcessor.ts` - Collection sync logic
- `brandMatcher.ts` - Brand matching/creation
- `deduplication.ts` - In-memory cache
- `documentIds.ts` - ID generation utilities
- `index.ts` - Re-exports all functions

---

## DRY Refactoring

From PR #115 (−1,400 lines, 8 new reusable components):

### When to Extract Components

1. **Duplicate UI patterns**: Same JSX in 3+ locations
2. **Similar logic**: Small variations, same core
3. **Reusable across routes**: Not just homepage vs PLP

**Real Example**: `MenContent.tsx` (357 lines) + `WomenContent.tsx` (357 lines) → `GenderMenuContent.tsx` (145 lines) = 569 lines saved

### When to Extract Hooks

1. **Stateful logic reused**: Same useState/useEffect pattern
2. **Side effects**: Event listeners, subscriptions
3. **Computed values**: Expensive calculations

**Real Example**:
```tsx
// Before: Copy-pasted in 5 components
const [expanded, setExpanded] = useState(new Set<string>());
const toggle = (id: string) => {
  setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};

// After: useSetToggle hook
const [expanded, toggle] = useSetToggle<string>();
```

### When to Extract Utilities

1. **Pure functions**: No side effects
2. **Used in 3+ places**: DRY threshold
3. **Testable in isolation**: Clear input/output

**Real Example**: `getNestedValue()` extracted from 3 webhook processors to `lib/utils/objectUtils.ts`

### Consolidate GROQ Projections

Extract common fields to shared constants in `groqUtils.ts`:
- Prevents drift between PDP, PLP, CARD queries
- Single source of truth
- Created `PRODUCT_CORE_PROJECTION`, `PRODUCT_VARIANTS_PROJECTION`

---

## Performance Patterns

From PRs #132, #130, #128, #120, #119, #111, #96

### GROQ Projections (60-80% payload reduction)

- **PDP**: Full detail (variants, options, nested categories)
- **PLP**: Lean (gallery, sizes, flat refs)
- **CARD**: Minimal (prices, images, basic info)

**Real Impact** (PR #126): Consolidated 3 duplicate product types into `CardProduct`, computed sizes at GROQ level → eliminated JS post-processing (`mapToMinimalProduct.ts` deleted)

### Optimistic UI Updates

Pattern from cart/store.ts (PR #135):

```typescript
// Immediate UI update
set({ items: updatedItems });

// Background API sync
queueMicrotask(async () => {
  await shopifyAPI.updateCart(...);
});
```

**Real Impact**: Cart quantity changes feel instant, Shopify sync happens in background with line ID mapping for abandoned cart tracking

### CSS-Only Interactions

Replace `useState` with Tailwind `group-hover` (PR #135):

```tsx
// ❌ Before
const [isHovered, setIsHovered] = useState(false);
<div onMouseEnter={() => setIsHovered(true)}>
  {isHovered && <SizesList />}
</div>

// ✅ After
<div className="group/card">
  <div className="hidden group-hover/card:block">
    <SizesList />
  </div>
</div>
```

**Benefits**: Zero JS state per card (28+ on PLP), removes `"use client"`, removes `memo`

### Lazy Loading Strategies

**Carousel Lazy Load** (PR #128):
```tsx
const MobileCarousel = dynamic(() => import('./MobileCarousel'), {
  ssr: false
});
```

Eliminates 28× `useEmblaCarousel()` hydration on PLP, unblocks hero LCP

**Bundle Optimization**:
- Add heavy libs to `optimizePackageImports` in next.config.js
- Use `next/dynamic` with `ssr: false` for client-only components
- Check bundle size with `bun build:analyze`

### Image Optimization

- LQIP from Sanity (`metadata.lqip`)
- Priority loading: `priority={index === 0}`
- Responsive `sizes` attribute matching Tailwind breakpoints
- 31-day cache (`minimumCacheTTL: 2678400`)
- Add common widths to `imageSizes` in next.config.js

**Real Fix** (PR #128): Aligned `sizes` to Tailwind `xl:` breakpoint (1279px) with `calc()` for gap/padding → browser picks 512px instead of 828px variants

### Zustand Selectors

Prevent unnecessary re-renders:

```tsx
// ❌ Wrong
const store = useCartStore(); // Re-renders on ANY store change

// ✅ Right
const items = useCartStore((s) => s.items); // Re-renders only when items change
```

**Real Impact** (PR #120): VariantSelector single-pass variant processing, stable refs prevent downstream memo() invalidation

### Suspense Streaming

Split slow fetches from hero rendering (PR #96):

```tsx
// ❌ Before
export default async function Page() {
  const [hero, products] = await Promise.all([
    getHero(),
    getProducts() // Slow GROQ blocks hero
  ]);
  return <>{hero}<ProductGrid products={products} /></>;
}

// ✅ After
export default async function Page() {
  const hero = await getHero(); // Fast, renders immediately
  return (
    <>
      {hero}
      <Suspense fallback={<Skeleton />}>
        <ProductsServer /> {/* Streams in when ready */}
      </Suspense>
    </>
  );
}
```

**Real Impact**: LCP 4.5s → 2.3s on /brands/unna

### React.cache() Deduplication

Prevent duplicate Sanity queries on same page (PR #96):

```tsx
import { cache } from 'react';

export const getProductByHandle = cache(async (handle: string) => {
  return await sanityFetch(query, { handle });
});
```

**When to Use**: Server components that might be rendered multiple times (layouts, parallel fetches)

---

## Accessibility (WCAG 2.1 AA)

From PRs #84, #85, #87

### Modal Accessibility

```tsx
// CartModal.tsx (PR #84)
import FocusLock from 'react-focus-lock';

useEffect(() => {
  if (isOpen) {
    document.body.inert = true;
  } else {
    document.body.inert = false;
  }
}, [isOpen]);

return (
  <FocusLock disabled={!isOpen}>
    <div role="dialog" aria-label="Shopping cart">
      {/* Modal content */}
    </div>
  </FocusLock>
);
```

- **inert attribute**: Set `document.body.inert = true` when modal opens
- **FocusLock**: Trap focus inside modal (react-focus-lock)
- **ARIA live regions**: Announce dynamic content changes
- **Close on Escape**: Always provide keyboard close option

### Semantic HTML

```tsx
// ❌ Wrong
<div role="link" onClick={...}>

// ✅ Right
<a href="..." onClick={...}>

// ❌ Wrong
<div onClick={toggle}>Toggle</div>

// ✅ Right
<button onClick={toggle}>Toggle</button>
```

**Real Fix** (PR #84): Replaced all `div[role="link"]` with native `<a>` tags, `div[onClick]` with `<button>`

### Keyboard Navigation

Pattern for interactive elements:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  {children}
</div>
```

- All interactive elements reachable via Tab
- Enter/Space activate buttons/links
- Arrow keys for carousels/galleries
- Escape closes modals/dropdowns

### Touch Targets

- Minimum 44×44px clickable area
- Use padding to enlarge small targets
- Test on real mobile devices

### Screen Reader Support

**Skip Link Pattern** (PR #84):
```tsx
// layout.tsx
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main" tabIndex={-1}>
  {children}
</main>
```

- **Skip link**: First focusable element jumps to main content
- **Descriptive aria-labels**: Not "Click here", but "View product details for Nike Pegasus 40"
- **Heading hierarchy**: H1 → H2 → H3, no skipping levels
- **Alt text**: Descriptive, not decorative

---

## SEO Patterns

### Canonical Tags (Required on ALL pages)

```typescript
// In generateMetadata functions
const url = `${BASE_URL}/path`;
return {
  alternates: { canonical: url },
  openGraph: { url, ... },
  twitter: { ... }
};
```

### Sitemap Generation

- Location: `src/app/sitemap.ts`
- Include: products, collections, brands, blog, category hierarchy
- Deduplicate category paths using `Set<string>`

### Structured Data (JSON-LD)

- `ProductJsonLd.tsx`: GTIN, pricing, availability
- `BreadcrumbJsonLd.tsx`: Navigation paths
- `OrganizationJsonLd.tsx`: Brand info

---

## Search Implementation

From PR #113

Location: `src/app/(main)/search/`

### GROQ Relevance Scoring

Use `score()` and `boost()` for weighted search:

```groq
*[
  _type == "product" &&
  (
    title match $query ||
    handle match $query ||
    vendor match $query ||
    tags[] match $query
  )
] | score(
  boost(title match $query, 3),
  boost(handle match $query, 2),
  boost(vendor match $query, 1.5),
  boost(tags[] match $query, 1)
) | order(_score desc)
```

**Benefits**:
- Title matches rank higher than tag matches
- More relevant results at top
- Natural language queries work better

### SearchModal Component

- Real-time search as user types
- Show products, brands, collections in same modal
- "See all results (X)" button → /search page
- Focus trap with FocusLock

### Search Page

- Server component fetching products via GROQ
- Pagination with `?page=2` URL state
- Client ProductListing for filtering
- URL state management (`?q=query&limit=28`)

---

## JSON-LD Structured Data

From PR #107

Location: `src/components/schemas/`

### ProductJsonLd

Rich snippets in search results:

```tsx
<ProductJsonLd
  product={{
    name: product.title,
    description: cleanDescription,
    image: images,
    sku: variant.sku,
    gtin: variant.barcode || variant.sku,
    offers: {
      price: variant.price,
      priceCurrency: "SEK",
      availability: variant.available ? "InStock" : "OutOfStock"
    }
  }}
/>
```

**Google Rich Results**: Product price, availability, ratings show in search

### BreadcrumbJsonLd

Navigation trail in SERPs:

```tsx
<BreadcrumbJsonLd
  crumbs={[
    { name: "Home", url: BASE_URL },
    { name: "Men's", url: `${BASE_URL}/mens` },
    { name: "Clothing", url: `${BASE_URL}/mens/clothing` },
    { name: product.title, url: productUrl }
  ]}
/>
```

### OrganizationJsonLd

Business info on all pages:

```tsx
<OrganizationJsonLd
  name="Zone2Run"
  url={BASE_URL}
  logo={`${BASE_URL}/logo.png`}
  sameAs={[
    "https://instagram.com/zone2run",
    "https://facebook.com/zone2run"
  ]}
/>
```

**Validation**: Test with [Google Rich Results Test](https://search.google.com/test/rich-results)

**Real Impact** (PR #107): Enabled rich snippets for 400+ products, improved CTR from search

---

## Common Corrections

Learn from these real mistakes:

### Import Paths

```typescript
// ❌ Wrong
import { sanityFetch } from "./live";

// ✅ Right
import { sanityFetch } from "@/sanity/lib/client";
```

Always use barrel exports from `getData.ts` for Sanity queries

### Missing "use client"

Components requiring `"use client"`:
- Any component using Zustand stores (CartModal, Header)
- Components with useState, useEffect, event handlers
- Components using browser-only APIs

**Real example** (PR #135): CartModal used hooks but lacked directive — worked only because parent was client boundary. Added `"use client"` explicitly

### Type Errors After Schema Changes

After modifying GROQ projections:

1. Update TypeScript types manually (`sanityProduct.ts`, `cardProduct.ts`)
2. Run `bun typegen` (only updates `sanity.types.ts`, not custom types)
3. Verify with `bun build`

**Real example** (PR #139): Added `barcode` to GROQ projection but forgot to update sanityProduct.ts variant type → build error. Fix: manually add `barcode?: string` to variant interface

### Type Safety Cascade

When adding fields to GROQ projections:

1. Update GROQ projection in `groqUtils.ts`
2. Update TypeScript type (CardProduct, SanityProduct, PLPProduct)
3. Run `bun typegen` if Sanity schema changed
4. Update components using that type
5. Run `bun build` to verify

### Canonical Tag Format

```typescript
// ❌ Wrong (relative)
canonical: "/products/handle"

// ✅ Right (absolute)
canonical: `${BASE_URL}/products/${handle}`
```

Google requires absolute URLs for canonical tags

### Alt Text Pattern

```tsx
// ❌ Wrong
alt=""

// ✅ Right
alt={image.alt || product.title}
alt={image.alt || "Product image"}
```

Always use descriptive alt text from GROQ data

### Commit Message Style

```
❌ Wrong: "SEO fixes ✨", "Update files", "Claude Code: Add feature"
✅ Right: feat: comprehensive SEO audit fixes (#139)
```

- Type prefix required
- No emojis
- No "Claude Code" attribution
- PR number in parens

---

## Self-Updating Workflow

After completing ANY task with corrections:

1. **Identify Pattern**
   - What went wrong?
   - What was the fix?
   - Is this a reusable pattern?

2. **Update CLAUDE.md**
   - Add to "Common Corrections" if it was a mistake
   - Add to relevant section if it's a new pattern
   - Update "Recent Learnings" with date + summary

3. **Commit Documentation**
   - Separate commit: `docs: update CLAUDE.md with [pattern]`
   - Include in PR or standalone PR to staging

**Trigger Phrases**:
- "Update CLAUDE.md so you don't make that mistake again"
- "Document this pattern in CLAUDE.md"
- "Add this to common corrections"

**Auto-Update Candidates**:
- Import path fixes
- Type safety issues
- Missing directives (`"use client"`, etc.)
- GROQ projection patterns
- Performance optimizations
