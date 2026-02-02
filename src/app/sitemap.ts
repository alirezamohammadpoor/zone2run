import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/locale/localeUtils";

interface ProductSitemapEntry {
  handle: string;
  updatedAt?: string;
}

interface CollectionSitemapEntry {
  slug: string;
  updatedAt?: string;
}

interface BrandSitemapEntry {
  slug: string;
  _updatedAt?: string;
}

interface BlogPostSitemapEntry {
  slug: string;
  category: string;
  publishedAt?: string;
}

interface CategoryPathEntry {
  gender: string;
  mainCategory?: string;
  subcategory?: string;
  specific?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

  // Fetch all dynamic content in parallel
  const [products, collections, brands, blogPosts, categoryPaths] =
    await Promise.all([
      client.fetch<ProductSitemapEntry[]>(
        `*[_type == "product" && !store.isDeleted]{ "handle": store.slug.current, "updatedAt": store.updatedAt }`
      ),
      client.fetch<CollectionSitemapEntry[]>(
        `*[_type == "collection" && !store.isDeleted]{ "slug": store.slug.current, "updatedAt": store.updatedAt }`
      ),
      client.fetch<BrandSitemapEntry[]>(
        `*[_type == "brand"]{ "slug": slug.current, _updatedAt }`
      ),
      client.fetch<BlogPostSitemapEntry[]>(
        `*[_type == "blogPost"]{ "slug": slug.current, "category": category->slug.current, publishedAt }`
      ),
      client.fetch<CategoryPathEntry[]>(
        `*[_type == "product" && !store.isDeleted && defined(gender) && defined(category)]{
          gender,
          "mainCategory": select(
            category->categoryType == "main" => category->slug.current,
            category->categoryType == "subcategory" => category->parentCategory->slug.current,
            category->categoryType == "specific" => category->parentCategory->parentCategory->slug.current
          ),
          "subcategory": select(
            category->categoryType == "subcategory" => category->slug.current,
            category->categoryType == "specific" => category->parentCategory->slug.current
          ),
          "specific": select(
            category->categoryType == "specific" => category->slug.current
          )
        }`
      ),
    ]);

  // Build locale-agnostic path lists, then expand across all locales
  const now = new Date();

  // Static paths with their priorities/frequencies
  const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/mens", changeFrequency: "daily", priority: 0.9 },
    { path: "/womens", changeFrequency: "daily", priority: 0.9 },
    { path: "/unisex", changeFrequency: "daily", priority: 0.8 },
    { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
    { path: "/brands", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  ];

  // Category paths - extract unique from products
  const categoryPathsSet = new Set<string>();
  for (const item of categoryPaths) {
    if (item.gender && item.mainCategory && item.subcategory && item.specific) {
      categoryPathsSet.add(
        `/${item.gender}/${item.mainCategory}/${item.subcategory}/${item.specific}`
      );
    }
    if (item.gender && item.mainCategory && item.subcategory) {
      categoryPathsSet.add(`/${item.gender}/${item.mainCategory}/${item.subcategory}`);
    }
    if (item.gender && item.mainCategory) {
      categoryPathsSet.add(`/${item.gender}/${item.mainCategory}`);
    }
  }

  // Helper: expand a single path across all locales
  const forAllLocales = (
    path: string,
    opts: { lastModified: Date; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number; isDefault?: boolean }
  ): MetadataRoute.Sitemap =>
    SUPPORTED_LOCALES.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: opts.lastModified,
      changeFrequency: opts.changeFrequency,
      // Default locale gets full priority, alternates slightly lower
      priority: locale === DEFAULT_LOCALE ? opts.priority : Math.max(0.1, opts.priority - 0.1),
    }));

  const entries: MetadataRoute.Sitemap = [];

  // Static pages × all locales
  for (const sp of staticPaths) {
    entries.push(...forAllLocales(sp.path, { lastModified: now, changeFrequency: sp.changeFrequency, priority: sp.priority }));
  }

  // Product pages × all locales
  for (const p of products) {
    if (!p.handle) continue;
    entries.push(...forAllLocales(`/products/${p.handle}`, {
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    }));
  }

  // Collection pages × all locales
  for (const c of collections) {
    if (!c.slug) continue;
    entries.push(...forAllLocales(`/collections/${c.slug}`, {
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  // Brand pages × all locales
  for (const b of brands) {
    if (!b.slug) continue;
    entries.push(...forAllLocales(`/brands/${b.slug}`, {
      lastModified: b._updatedAt ? new Date(b._updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  }

  // Blog pages × all locales
  for (const post of blogPosts) {
    if (!post.slug || !post.category) continue;
    entries.push(...forAllLocales(`/blog/${post.category}/${post.slug}`, {
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  }

  // Category pages × all locales
  for (const path of categoryPathsSet) {
    entries.push(...forAllLocales(path, {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    }));
  }

  return entries;
}
