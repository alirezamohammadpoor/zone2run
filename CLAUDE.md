# Zone2Run - Comprehensive Project Guide

## Project Overview

**Zone2Run** is a premium headless e-commerce platform specializing in running and athletic apparel. The site combines the content flexibility of Sanity CMS with the robust e-commerce infrastructure of Shopify, delivered through a performant Next.js frontend.

### Business Context
- **Market**: Premium running/athletic apparel
- **Currency**: SEK (Swedish Krona)
- **VAT**: 25% included in prices
- **Target**: Scandinavian market with international reach

---

## Technology Stack

### Core Technologies

| Technology | Version | Role |
|------------|---------|------|
| **Next.js** | 16.0.1 | App Router, React 19.2.0, Server Components |
| **Sanity CMS** | 4.10.1 | Content management, Visual editing |
| **Shopify** | Storefront API 2024-01 | Headless commerce backend |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **Zustand** | 5.0.6 | Client-side state management |
| **TypeScript** | 5.x | Type safety throughout |
| **Vercel** | - | Hosting, Analytics, Edge functions |

### Key Dependencies
- `next-sanity` (11.4.2) - Sanity/Next.js integration
- `@sanity/visual-editing` (4.0.2) - Live preview/editing
- `@portabletext/react` (4.0.3) - Rich text rendering
- `graphql-request` (6.1.0) - Shopify API client
- `embla-carousel-react` (8.6.0) - Carousels
- `lucide-react` (0.525.0) - Icons

---

## Architecture Deep Dive

### Data Flow Architecture

```
┌─────────────┐     Webhooks      ┌─────────────┐
│   SHOPIFY   │ ─────────────────▶│   SANITY    │
│  (Products, │                   │  (Enriched  │
│   Variants, │                   │   Content,  │
│   Pricing)  │                   │   Editorial)│
└─────────────┘                   └──────┬──────┘
                                         │
                                    GROQ Queries
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │   NEXT.JS   │
                                  │   (SSR/SSG) │
                                  └──────┬──────┘
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                              ▼                     ▼
                       ┌───────────┐         ┌───────────┐
                       │  Browser  │         │  Shopify  │
                       │   (Cart,  │────────▶│  Checkout │
                       │   Zustand)│         │           │
                       └───────────┘         └───────────┘
```

### Why This Architecture?
1. **Shopify** handles what it does best: inventory, payments, checkout
2. **Sanity** provides editorial flexibility: custom fields, images, rich content
3. **Next.js** delivers performance: SSR, image optimization, edge caching
4. **Webhooks** keep everything in sync automatically

---

## Directory Structure

```
zone2run/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout (Header, Footer)
│   │   ├── globals.css               # Global styles
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── shopify-product-webhook/  # Main webhook handler (1400+ lines)
│   │   │   ├── sync-existing-products/   # Bulk sync utility
│   │   │   ├── draft/                    # Enable preview mode
│   │   │   └── disable-draft/            # Disable preview mode
│   │   │
│   │   ├── products/[handle]/        # Product detail pages
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── collections/              # Collection pages
│   │   │   ├── page.tsx              # All collections
│   │   │   └── [slug]/               # Single collection
│   │   │
│   │   ├── mens/                     # Gender categories (3-level nesting)
│   │   │   ├── page.tsx              # All men's products
│   │   │   ├── [mainCategory]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [subcategory]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [specificCategory]/
│   │   │   │           └── page.tsx
│   │   │   └── loading.tsx (at each level)
│   │   │
│   │   ├── womens/                   # Same structure as mens/
│   │   ├── unisex/                   # Same structure as mens/
│   │   │
│   │   ├── brands/                   # Brand pages
│   │   │   ├── page.tsx              # All brands
│   │   │   └── [slug]/               # Single brand
│   │   │
│   │   ├── blog/                     # Blog section
│   │   │   ├── page.tsx
│   │   │   └── [category]/[postSlug]/
│   │   │
│   │   ├── studio/[[...tool]]/       # Embedded Sanity Studio
│   │   └── order-confirmation/       # Post-checkout page
│   │
│   ├── components/
│   │   ├── Header.tsx                # Client: nav, cart icon, search
│   │   ├── HeaderServer.tsx          # Server wrapper for Header
│   │   ├── Footer.tsx                # Site footer
│   │   ├── ProductCard.tsx           # Reusable product card
│   │   ├── ProductGrid.tsx           # Product grid layout
│   │   ├── ProductGridWithImages.tsx # Grid with editorial images
│   │   ├── CartModal.tsx             # Slide-out cart
│   │   ├── SearchModal.tsx           # Search overlay
│   │   ├── PreviewBanner.tsx         # Draft mode indicator
│   │   ├── VisualEditing.tsx         # Sanity visual editing overlay
│   │   │
│   │   ├── homepage/                 # Homepage modules
│   │   │   ├── HomePageSanity.tsx    # Main orchestrator
│   │   │   ├── heroModule.tsx        # Hero section
│   │   │   ├── featuredProductsModuleComponent.tsx
│   │   │   ├── editorialModule.tsx   # Blog carousel
│   │   │   ├── imageModule.tsx       # Full-width media
│   │   │   ├── contentModule.tsx     # Flexible content
│   │   │   ├── spotifyPlaylistsModule.tsx
│   │   │   ├── HomeProductCard.tsx
│   │   │   └── HomeProductGrid.tsx
│   │   │
│   │   ├── product/                  # Product page components
│   │   │   ├── ProductDetails.tsx    # Main product info
│   │   │   ├── ProductGallery.tsx    # Image gallery
│   │   │   ├── VariantSelector.tsx   # Size/color dropdowns
│   │   │   ├── VariantSelectorList.tsx
│   │   │   ├── AddToCart.tsx         # Add to cart button
│   │   │   ├── ColorVariants.tsx     # Color swatches
│   │   │   ├── ProductTabs.tsx       # Description/details tabs
│   │   │   ├── ProductEditorialImages.tsx
│   │   │   ├── RelatedProducts.tsx
│   │   │   ├── RelatedProductsServer.tsx
│   │   │   ├── AddedToCartModal.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── SortModal.tsx
│   │   │
│   │   ├── menumodal/                # Navigation drawer
│   │   │   ├── MenuModal.tsx         # Main modal
│   │   │   ├── MenContent.tsx
│   │   │   ├── WomenContent.tsx
│   │   │   ├── BrandContent.tsx
│   │   │   ├── HelpContent.tsx
│   │   │   ├── OurSpaceContent.tsx
│   │   │   └── menuConfig.ts         # Menu structure config
│   │   │
│   │   ├── blog/                     # Blog components
│   │   │   ├── BlogProductCard.tsx
│   │   │   ├── BlogProductGrid.tsx
│   │   │   └── BlogProductCarousel.tsx
│   │   │
│   │   └── skeletons/                # Loading states
│   │       ├── BaseSkeleton.tsx
│   │       ├── ProductCardSkeleton.tsx
│   │       ├── ProductGridSkeleton.tsx
│   │       ├── ProductDetailsSkeleton.tsx
│   │       ├── ProductGallerySkeleton.tsx
│   │       └── ... (many more)
│   │
│   ├── sanity/
│   │   ├── lib/                      # Data fetching layer
│   │   │   ├── client.ts             # Sanity client setup
│   │   │   ├── getData.ts            # Barrel file (re-exports)
│   │   │   ├── getHomepage.ts        # Homepage queries
│   │   │   ├── getProducts.ts        # Product queries
│   │   │   ├── getCollections.ts     # Collection queries
│   │   │   ├── getCategories.ts      # Category queries
│   │   │   ├── getBrands.ts          # Brand queries
│   │   │   ├── getBlog.ts            # Blog queries
│   │   │   ├── getMenu.ts            # Navigation queries
│   │   │   ├── groqUtils.ts          # Shared GROQ projections
│   │   │   ├── image.ts              # Image URL builder
│   │   │   └── live.ts               # Live preview setup
│   │   │
│   │   ├── schemaTypes/
│   │   │   ├── index.ts              # Schema registry
│   │   │   ├── product.ts            # Product schema
│   │   │   ├── brand.ts              # Brand schema
│   │   │   ├── category.ts           # Category schema (3-level)
│   │   │   ├── siteSettings.ts
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── homepageVersion.ts  # Swappable homepages
│   │   │   │   └── page.ts             # Custom pages
│   │   │   │
│   │   │   ├── singletons/
│   │   │   │   ├── homeType.ts
│   │   │   │   ├── menuType.ts
│   │   │   │   ├── settingsType.ts
│   │   │   │   └── siteSettings.ts
│   │   │   │
│   │   │   ├── homepage/             # Homepage module schemas
│   │   │   │   ├── heroModule.ts
│   │   │   │   ├── featuredProductsModule.ts
│   │   │   │   ├── editorialModule.ts
│   │   │   │   ├── imageModule.ts
│   │   │   │   ├── portableTextModule.ts  # Content module
│   │   │   │   └── spotifyPlaylistsModule.ts
│   │   │   │
│   │   │   ├── objects/              # Reusable schema objects
│   │   │   │   ├── shopify/          # Shopify-related types
│   │   │   │   ├── module/           # Module building blocks
│   │   │   │   ├── global/           # Global objects
│   │   │   │   ├── hotspot/          # Image hotspots
│   │   │   │   └── seoType.ts
│   │   │   │
│   │   │   └── blog/
│   │   │       ├── blogPost.ts
│   │   │       ├── blogCategory.ts
│   │   │       └── blogProductsModule.ts
│   │   │
│   │   ├── structure.ts              # Studio sidebar structure
│   │   └── studio/                   # Studio customizations
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── client.ts                 # GraphQL client setup
│   │   ├── shopify/
│   │   │   ├── queries.ts            # Shopify GraphQL queries
│   │   │   ├── cart.ts               # Cart API functions
│   │   │   └── products.ts           # Product fetching
│   │   │
│   │   ├── cart/
│   │   │   ├── store.ts              # Zustand cart store
│   │   │   ├── types.ts              # Cart types
│   │   │   └── uiStore.ts            # Cart UI state
│   │   │
│   │   ├── product/
│   │   │   ├── getAllProducts.ts
│   │   │   └── getProductByHandle.ts
│   │   │
│   │   └── utils/
│   │       ├── formatPrice.ts        # Price formatting (SEK)
│   │       └── brandUrls.ts          # Brand URL helpers
│   │
│   ├── types/
│   │   ├── sanityProduct.ts          # Product types
│   │   ├── shopify.ts                # Shopify response types
│   │   ├── product.ts                # Combined product types
│   │   ├── menu.ts                   # Navigation types
│   │   └── sanity.ts                 # Sanity utilities
│   │
│   ├── hooks/                        # Custom React hooks
│   └── store/
│       ├── searchStore.tsx           # Search state
│       ├── variantStore.ts           # Variant selection
│       └── scroll.ts                 # Scroll position
│
├── sanity.config.ts                  # Sanity configuration
├── sanity.types.ts                   # Auto-generated types (35KB)
├── schema.json                       # JSON schema export (267KB)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind configuration
├── package.json
└── tsconfig.json
```

---

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm lint             # Run ESLint

# Build
pnpm build            # Production build
pnpm build:analyze    # Build with bundle analyzer
pnpm start            # Start production server

# Types
pnpm typegen          # Regenerate Sanity types (run after schema changes!)
```

---

## Key Patterns & Conventions

### Server vs Client Components

```typescript
// DEFAULT: Server Component (no directive needed)
// - Use for: data fetching, static content, SEO
async function ProductPage({ params }) {
  const product = await getProductByHandle(params.handle);
  return <ProductDetails product={product} />;
}

// CLIENT: Add "use client" directive
// - Use for: interactivity, hooks, browser APIs
"use client";
function AddToCartButton({ productId }) {
  const { addItem } = useCartStore();
  return <button onClick={() => addItem(productId)}>Add</button>;
}
```

### Data Fetching Pattern

All data fetching is modular and server-side:

```typescript
// src/sanity/lib/getProducts.ts
import { client } from './client';

export async function getProductByHandle(handle: string) {
  return client.fetch(
    `*[_type == "product" && store.slug.current == $handle][0]{
      ${productProjection}
    }`,
    { handle }
  );
}

// Usage in page.tsx
import { getProductByHandle } from '@/sanity/lib/getProducts';

export default async function ProductPage({ params }) {
  const product = await getProductByHandle(params.handle);
  // ...
}
```

### Cart State Management

```typescript
// Zustand store with localStorage persistence
import { useCartStore } from '@/lib/cart/store';

function CartButton() {
  const { items, addItem, removeItem, getTotalItems, checkout } = useCartStore();

  // Add item
  addItem({ variantId, title, price, quantity: 1 });

  // Checkout redirects to Shopify
  await checkout();
}
```

### Styling Conventions

```typescript
// Tailwind utility classes only
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-8">
  <h1 className="text-2xl font-medium tracking-wide">Title</h1>
  <p className="text-sm leading-relaxed text-gray-600">Description</p>
</div>

// Common patterns:
// - Font: Helvetica Neue (sans-serif)
// - Letter-spacing: tracking-wide (0.03rem)
// - Line-height: leading-relaxed (1.8)
// - Mobile-first: base → md: → lg:
```

### Loading States

Every route has a `loading.tsx` with skeleton components:

```typescript
// src/app/products/[handle]/loading.tsx
import { ProductDetailsSkeleton } from '@/components/skeletons/ProductDetailsSkeleton';

export default function Loading() {
  return <ProductDetailsSkeleton />;
}
```

---

## Homepage System

### Modular Architecture

The homepage uses swappable versions with modular content blocks:

```typescript
// Site Settings → Active Homepage Version → Modules[]

// Module Types:
type HomepageModule =
  | { _type: 'heroModule'; ... }           // Hero with video/image + CTA
  | { _type: 'featuredProductsModule'; ... } // Curated product grid
  | { _type: 'editorialModule'; ... }      // Blog carousel
  | { _type: 'imageModule'; ... }          // Full-width media
  | { _type: 'portableTextModule'; ... }   // Flexible content (4 layouts)
  | { _type: 'spotifyPlaylistsModule'; ... } // Playlist embeds
```

### Content Module Layouts

The `portableTextModule` (content module) supports 4 layout variations:
1. **Left image + Right products** - Editorial image with product grid
2. **Top image + Bottom products** - Stacked layout
3. **Products only** - Full-width product grid
4. **Image only** - Full-width editorial image

---

## Category System

### 3-Level Hierarchy

```
Gender (mens/womens/unisex)
└── Main Category (clothing, footwear, accessories)
    └── Subcategory (tops, bottoms, shorts)
        └── Specific Category (running-shorts, compression-shorts)
```

### URL Structure

```
/mens                                    # All men's products
/mens/clothing                           # Main category
/mens/clothing/tops                      # Subcategory
/mens/clothing/tops/t-shirts             # Specific category
```

### Category Detection

Categories are auto-assigned via webhook based on Shopify product type:

```typescript
// Webhook extracts from product.productType
"Running Shorts" → { main: "clothing", sub: "bottoms", specific: "running-shorts" }
```

---

## Shopify Webhook Integration

### Webhook Handler (`/api/shopify-product-webhook`)

The webhook handler (1400+ lines) processes:

1. **Product Events**: CREATE, UPDATE, DELETE
2. **Collection Events**: Sync products to collections

### Processing Steps

```
1. Validate webhook signature
2. Check for duplicate (5-min cache)
3. Extract metadata:
   - Gender from title/tags ("Men's", "Women's", "M's", "W's")
   - Category from productType
   - Brand from vendor
4. Process images:
   - Download from Shopify CDN
   - Optimize (WebP, 1200px max, 85% quality)
   - Upload to Sanity
5. Create/update documents:
   - Product document
   - Brand (auto-create if needed)
   - Category references
   - Collection memberships
```

### Triggering Sync

```bash
# Manual bulk sync (all products)
curl -X POST https://yoursite.com/api/sync-existing-products

# Single product (via Shopify Admin → Products → Edit → Save)
# Webhook triggers automatically
```

---

## Visual Editing & Preview

### Draft Mode

Content editors can preview unpublished changes:

```typescript
// Enable: /api/draft?secret=xxx&slug=/products/some-product
// Disable: /api/disable-draft

// Check in component:
import { draftMode } from 'next/headers';
const { isEnabled } = draftMode();
```

### Sanity Presentation Tool

- Live preview in Sanity Studio
- Click-to-edit overlays on frontend
- Real-time content updates

---

## Environment Variables

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...              # For server-side queries

# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxx  # Public token

# Shopify Admin API (webhooks only)
SHOPIFY_ADMIN_API_TOKEN=shpat_xxx         # Private, server-only

# Site
NEXT_PUBLIC_SITE_URL=https://zone2run.com  # For preview mode callbacks
```

---

## Common Development Tasks

### Adding a New Homepage Module

1. **Create schema** in `src/sanity/schemaTypes/homepage/newModule.ts`
2. **Register schema** in `src/sanity/schemaTypes/index.ts`
3. **Add to homepage array** in `src/sanity/schemaTypes/documents/homepageVersion.ts`
4. **Create component** in `src/components/homepage/newModule.tsx`
5. **Add to switch** in `src/components/homepage/HomePageSanity.tsx`
6. **Regenerate types**: `pnpm typegen`

### Adding a Product Field

1. **Update schema** in `src/sanity/schemaTypes/product.ts`
2. **Update webhook** if synced from Shopify (`/api/shopify-product-webhook`)
3. **Update GROQ projection** in `src/sanity/lib/groqUtils.ts`
4. **Update types**: `pnpm typegen`

### Debugging Data Issues

```bash
# Check Sanity data
# Visit /studio → Vision tool → Run GROQ queries

# Check webhook logs
# Vercel Dashboard → Functions → shopify-product-webhook

# Re-sync all products
curl -X POST https://yoursite.com/api/sync-existing-products
```

### Performance Optimization

```bash
# Analyze bundle
pnpm build:analyze

# Key optimizations already in place:
# - Server Components (default)
# - Code splitting (Sanity Studio separate chunk)
# - Image optimization (AVIF/WebP)
# - CDN caching (Sanity, Shopify)
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Utilities | camelCase | `formatPrice.ts` |
| Directories | kebab-case | `menu-modal/` |
| Sanity schemas | camelCase | `heroModule.ts` |
| Types | PascalCase | `SanityProduct.ts` |

---

## Important Reminders

1. **Always Server Components** unless you need interactivity
2. **Run `pnpm typegen`** after ANY Sanity schema change
3. **Cart persists to localStorage** - survives page refreshes
4. **Images use CDNs** - Sanity (`cdn.sanity.io`) and Shopify (`cdn.shopify.com`)
5. **Prices in SEK** with 25% VAT included
6. **Check webhook logs** first when debugging sync issues
7. **Use loading.tsx** for loading states, not spinners in components

---

## Recent Development

Current branch: `feature/homepage-responsive`

Recent features added:
- Preview mode & visual editing (#31)
- Swappable homepage system (#30)
- Loading states with skeletons (#29)
- Modularized data fetching (#28)
- Enhanced product page UX (#27)
