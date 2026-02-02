import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { DEFAULT_LOCALE } from "@/lib/locale/localeUtils";

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

  const localeBase = `${baseUrl}/${DEFAULT_LOCALE}`;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: localeBase,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${localeBase}/mens`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${localeBase}/womens`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${localeBase}/unisex`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${localeBase}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${localeBase}/brands`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${localeBase}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.handle)
    .map((p) => ({
      url: `${localeBase}/products/${p.handle}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${localeBase}/collections/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Brand pages
  const brandPages: MetadataRoute.Sitemap = brands
    .filter((b) => b.slug)
    .map((b) => ({
      url: `${localeBase}/brands/${b.slug}`,
      lastModified: b._updatedAt ? new Date(b._updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.slug && post.category)
    .map((post) => ({
      url: `${localeBase}/blog/${post.category}/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  // Category pages - extract unique paths from products
  const categoryUrlsSet = new Set<string>();

  for (const item of categoryPaths) {
    // Build URLs based on available category levels
    if (item.gender && item.mainCategory && item.subcategory && item.specific) {
      categoryUrlsSet.add(
        `/${item.gender}/${item.mainCategory}/${item.subcategory}/${item.specific}`
      );
    }
    if (item.gender && item.mainCategory && item.subcategory) {
      categoryUrlsSet.add(`/${item.gender}/${item.mainCategory}/${item.subcategory}`);
    }
    if (item.gender && item.mainCategory) {
      categoryUrlsSet.add(`/${item.gender}/${item.mainCategory}`);
    }
  }

  const categoryPages: MetadataRoute.Sitemap = Array.from(categoryUrlsSet).map(
    (path) => ({
      url: `${localeBase}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })
  );

  return [
    ...staticPages,
    ...productPages,
    ...collectionPages,
    ...brandPages,
    ...blogPages,
    ...categoryPages,
  ];
}
