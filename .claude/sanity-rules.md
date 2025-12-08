# Sanity Development Guidelines

## Schema Rules

### Required Imports

Always use Sanity TypeScript definitions:

```typescript
import { defineField, defineType, defineArrayMember } from 'sanity'
```

### Schema Structure

Every field must use `defineField`, every type must use `defineType`:

```typescript
export const mySchema = defineType({
  type: 'document',
  name: 'mySchema',
  title: 'My Schema',
  icon: SomeIcon, // Always include an icon
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Explain what this does for content editors',
      type: 'string',
    }),
  ],
})
```

### Icons

1. First check `@sanity/icons`
2. Fall back to `lucide-react` if no suitable icon exists
3. Always use named exports

### Field Requirements

Every field must have:
- `name` (camelCase)
- `title` (Human readable)
- `description` (Explain for non-technical users)
- `type`

---

## Zone2Run Schema Locations

```
src/sanity/schemaTypes/
├── index.ts                    # Schema registry
├── product.ts                  # Product schema
├── brand.ts                    # Brand schema
├── category.ts                 # 3-level category schema
│
├── documents/
│   └── homepageVersion.ts      # Swappable homepage versions
│
├── singletons/
│   ├── homeType.ts
│   ├── menuType.ts
│   └── settingsType.ts
│
├── homepage/                   # Homepage modules
│   ├── heroModule.ts
│   ├── featuredProductsModule.ts (deprecated)
│   ├── portableTextModule.ts   # Content module
│   ├── editorialModule.ts
│   ├── imageModule.ts (deprecated)
│   └── spotifyPlaylistsModule.ts
│
├── objects/                    # Reusable objects
│   ├── shopify/
│   ├── module/
│   └── global/
│
└── blog/
    ├── blogPost.ts
    └── blogCategory.ts
```

---

## Adding a New Homepage Module

1. Create schema in `src/sanity/schemaTypes/homepage/newModule.ts`
2. Register in `src/sanity/schemaTypes/index.ts`
3. Add to `homepageVersion.ts` modules array
4. Create component in `src/components/homepage/newModule.tsx`
5. Add case to `HomePageSanity.tsx` switch
6. Run `pnpm typegen`

---

## GROQ Query Rules

### Image Projections

Don't expand images unless needed. Include hotspot when using focal point cropping:

```typescript
// Basic (no expansion)
image

// With hotspot for responsive cropping
image {
  asset-> { url, metadata },
  alt,
  hotspot
}
```

### Query Organization

Queries live in `src/sanity/lib/`:
- `getHomepage.ts` - Homepage queries
- `getProducts.ts` - Product queries
- `getCollections.ts` - Collection queries
- `getBrands.ts` - Brand queries
- `getBlog.ts` - Blog queries
- `groqUtils.ts` - Shared projections

### Naming Conventions

```typescript
// Query functions: get + Entity
export async function getProductByHandle(handle: string)
export async function getAllBrands()
export async function getHomepageData()

// Projections: entityProjection
const productProjection = `...`
const brandProjection = `...`
```

---

## Type Generation

After ANY schema change:

```bash
pnpm typegen
```

This regenerates `sanity.types.ts` with TypeScript definitions.

---

## Common Field Templates

### Image with Hotspot

```typescript
defineField({
  name: 'image',
  title: 'Image',
  type: 'image',
  description: 'Use the hotspot tool to set focal point for responsive cropping',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describe the image for accessibility and SEO',
    }),
  ],
})
```

### Video

```typescript
defineField({
  name: 'video',
  title: 'Video',
  type: 'file',
  description: 'MP4 format recommended. Keep under 10MB for performance.',
  options: { accept: 'video/*' },
})
```

### Product Reference

```typescript
defineField({
  name: 'products',
  title: 'Products',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'product' }] }],
  description: 'Select products to display',
})
```

### Layout Options

```typescript
defineField({
  name: 'layout',
  title: 'Layout',
  type: 'string',
  options: {
    list: [
      { title: 'Full Width', value: 'full-width' },
      { title: 'Split', value: 'split' },
    ],
    layout: 'radio',
  },
  initialValue: 'full-width',
})
```

---

## File Naming

- Use **kebab-case** for all files: `hero-module.ts`, `blog-post.ts`
- Use `.ts` for schemas (not `.tsx`)
- Match component name: `heroModule.ts` → `heroModule.tsx`
