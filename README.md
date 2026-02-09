# Zone2Run

Premium headless e-commerce for running apparel. Multi-locale, multi-currency storefront serving 26 European markets.

**Version**: 2.13.0
**Production**: https://zone2run-build.vercel.app
**Package Manager**: Bun

---

## Tech Stack

| Tech | Version | Role |
|------|---------|------|
| Next.js | 16.1.6 | App Router, Server Components, ISR |
| React | 19.2.1 | UI |
| Sanity | 4.22.0 | CMS, Visual Editing, Studio |
| Shopify | Storefront API 2024-01 | Commerce backend, checkout |
| Zustand | 5.0.10 | Client state (cart, UI, recently viewed) |
| Tailwind | 3.4.19 | Styling |
| TypeScript | 5.9.3 | Type safety |

---

## Architecture

```
Shopify ──webhooks──> Sanity ──GROQ──> Next.js ──> Browser
                                           │
                                    Shopify Checkout
```

- **Shopify**: Inventory, pricing, variants, checkout. Source of truth for commerce data.
- **Sanity**: Enriched content layer. Products are synced from Shopify via webhooks, then extended with editorial content, categories, and brand data.
- **Next.js**: SSR/ISR rendering. Server Components by default. Locale-first routing with middleware.
- **Zustand**: Client-side cart with optimistic updates. Persisted to localStorage. Background sync to Shopify Storefront API.

---

## Directory Structure

```
src/
├── app/
│   ├── [locale]/(main)/           # Locale-first routing (26 countries)
│   │   ├── page.tsx               # Homepage (modular blocks from Sanity)
│   │   ├── products/[handle]/     # PDP
│   │   ├── mens/[main]/[sub]/[specific]/  # 3-level category hierarchy
│   │   ├── womens/[...path]/      # Mirror of mens
│   │   ├── brands/[slug]/         # Brand pages
│   │   ├── collections/[slug]/    # Collection pages
│   │   ├── blog/[category]/[post] # Blog
│   │   ├── search/                # Search results
│   │   └── order-confirmation/
│   ├── (studio)/studio/           # Sanity Studio (isolated route group)
│   ├── api/
│   │   ├── shopify-product-webhook/  # Main sync endpoint
│   │   ├── revalidate/              # ISR invalidation
│   │   ├── sync-existing-products/  # Manual bulk resync
│   │   ├── draft/                   # Sanity preview toggle
│   │   └── update-soar-brand/       # Brand sync
│   ├── middleware.ts              # Locale detection + routing
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/                    # 66 components
│   ├── product/                   # PDP: VariantSelector, AddToCart, Gallery, Tabs
│   ├── plp/                       # PLP: ProductListing, FilterSortModal, filters
│   ├── homepage/                  # Modular blocks: Hero, Editorial, Content, Image, Spotify
│   ├── menumodal/                 # Mobile nav: MenuModal, GenderMenuContent
│   ├── header/                    # Desktop nav: DesktopDropdown
│   ├── schemas/                   # JSON-LD: Product, Breadcrumb, Organization
│   ├── ui/                        # Shared: CollapsibleSection, Backdrop, ModalHeader
│   ├── Header.tsx                 # Client nav orchestrator
│   ├── ProductCard.tsx            # Memoized card (used on PLP, homepage, search)
│   ├── CartModal.tsx              # Slide-out cart
│   └── SearchModal.tsx            # Search overlay
│
├── sanity/
│   ├── lib/                       # 14 query files
│   │   ├── getData.ts             # Barrel export (single import point)
│   │   ├── groqUtils.ts           # Shared GROQ projections (3 tiers)
│   │   ├── getProducts.ts         # Search, category filtering
│   │   ├── getHomepage.ts         # Homepage modules
│   │   └── get*.ts                # Domain-specific queries
│   └── schemaTypes/               # Sanity schemas (product, brand, category, homepage modules)
│
├── lib/
│   ├── cart/
│   │   ├── store.ts               # Zustand cart (localStorage persist, optimistic updates)
│   │   └── uiStore.ts             # UI state (modals, toasts)
│   ├── shopify/                   # Storefront API GraphQL client
│   ├── webhook/                   # 8 modular files (~1,900 LOC)
│   │   ├── productProcessor.ts    # Product sync
│   │   ├── collectionProcessor.ts # Collection sync
│   │   ├── brandMatcher.ts        # Vendor → brand mapping
│   │   ├── deduplication.ts       # In-memory dedup cache
│   │   └── documentIds.ts         # ID generation
│   ├── locale/
│   │   ├── countries.ts           # 26 countries, 5 currencies
│   │   ├── LocaleContext.tsx       # React context for client-side locale
│   │   └── localeUtils.ts         # Country ↔ locale mapping
│   └── utils/                     # Shared utilities
│
├── hooks/                         # 9 custom hooks
│   ├── useFilteredProducts.ts     # PLP filter + sort
│   ├── useUrlFilters.ts           # URL state ↔ filter sync
│   ├── useSetToggle.ts            # Set<T> toggle (accordions)
│   ├── useHasMounted.ts           # Hydration guard
│   ├── useModalScrollRestoration.ts
│   └── useHorizontalSwipe.ts     # Touch swipe for carousels
│
└── types/                         # 5 type files
    ├── cardProduct.ts             # Minimal (search, homepage)
    ├── plpProduct.ts              # Lean (category, brand pages)
    ├── sanityProduct.ts           # Full (PDP)
    ├── shopify.ts                 # Shopify GraphQL types
    └── menu.ts                    # Navigation types
```

---

## Key Architecture Decisions

### Locale-First Routing
Every URL is prefixed with a locale segment (e.g., `/en-se/products/pegasus-40`). Middleware detects country from cookies/geo, redirects if missing. 26 countries across 5 currencies (SEK, NOK, DKK, EUR, GBP).

### 3-Tier GROQ Projections
Queries in `groqUtils.ts` define three projection levels to minimize payload sizes:
- **PDP**: Full detail — variants, options, description, category hierarchy, brand logo (~8KB)
- **PLP**: Lean — gallery, price range, sizes array, flat refs (~3KB)
- **Card**: Minimal — title, price, primary image, brand name (~1KB)

### Optimistic Cart
Cart state lives in Zustand with localStorage persistence. `addItem()` updates UI instantly, then syncs to Shopify via `queueMicrotask()`. Line IDs are mapped (`variantId → shopifyLineId`) for subsequent quantity updates.

### Webhook System
Shopify product/collection webhooks are processed through 8 modular files in `src/lib/webhook/`. Flow: HMAC validation → dedup check (5-min in-memory cache) → extract gender/brand/category → process images → create/update Sanity documents → trigger ISR revalidation across all 26 locales.

### Server Components by Default
~68% of components use `"use client"` — only where required (Zustand consumers, event handlers, browser APIs). Data fetching happens in server components, passed as props to client UI.

### Performance
- **Dynamic imports**: Modals (MenuModal, CartModal, FocusLock), Embla carousel — lazy loaded
- **CSS-only interactions**: `group-hover` replaces `useState` on product cards (zero JS per card)
- **Image optimization**: Sanity LQIP placeholders, 31-day cache TTL, responsive `sizes` matching Tailwind breakpoints
- **Suspense streaming**: Slow fetches (related products, editorial) streamed independently

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed
- Sanity project with dataset
- Shopify store with Storefront API access

### Environment Variables

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_READ_TOKEN=           # Server only

# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_ADMIN_API_TOKEN=         # Server only

# Site
NEXT_PUBLIC_SITE_URL=
SANITY_PREVIEW_SECRET=
SANITY_REVALIDATE_SECRET=
```

### Commands

```bash
bun install          # Install dependencies
bun dev              # Dev server (localhost:3000)
bun build            # Production build
bun build:analyze    # Bundle analysis
bun lint             # ESLint
bun typegen          # Regenerate Sanity types (required after schema changes)
```

---

## Component Breakdown

| Group | Files | Key Components |
|-------|-------|----------------|
| `product/` | 12 | VariantSelector, AddToCart, ProductGalleryClient, ProductTabs |
| `homepage/` | 7 | HeroModule, EditorialModule, ContentModule (4 layouts), ImageModule |
| `plp/` | 6 | ProductListing, FilterSortModal, CollapsibleFilterSection |
| `menumodal/` | 4 | MenuModal, GenderMenuContent (shared men/women) |
| `schemas/` | 5 | ProductJsonLd, BreadcrumbJsonLd, OrganizationJsonLd |
| `ui/` | 4 | CollapsibleSection, Backdrop, ModalHeader |
| Root-level | 22 | Header, CartModal, SearchModal, ProductCard, CountrySwitcher |

---

## Notable Patterns

- **Barrel exports**: All Sanity queries imported from `@/sanity/lib/getData`
- **Extracted hooks**: `useSetToggle` (5 consumers), `useUrlFilters` + `useUrlSort` (URL state management)
- **Modal accessibility**: FocusLock + `document.body.inert` + `aria-live` regions + Escape to close
- **SEO**: JSON-LD structured data (Product, Breadcrumb, Organization), `sitemap.ts`, canonical tags on all pages
- **Category system**: 3-level hierarchy (Gender → Main → Sub → Specific), auto-assigned via webhook from Shopify `productType`
- **Homepage modules**: Swappable blocks configured in Sanity — Hero, FeaturedProducts, Editorial, Image, Content (4 layout variants), SpotifyPlaylists

---

## Known Trade-offs

| Area | Trade-off | Mitigation |
|------|-----------|------------|
| Webhook dedup | In-memory cache — lost on deploy | Consider Redis for scale |
| Cart sync | Silent failures on Shopify API errors | Users see local state; logs capture errors |
| Category hierarchy | 3-level deep routes + complex GROQ | Shared projections in groqUtils.ts |
| Sanity Studio | Bundled in same app | Isolated via `(studio)` route group + webpack chunk splitting |
| Image cache | 31-day TTL | New images get new URLs (cache busted); replaced images stale for 31 days |

---

## Git Workflow

```
feature/* → staging → main
```

- Commit format: `type: description` (feat, fix, perf, refactor, chore)
- One focused feature per PR
- PRs target `staging`, releases merge `staging → main` with version bump
