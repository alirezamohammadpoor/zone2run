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
