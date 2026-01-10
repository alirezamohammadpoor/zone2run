import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

  // Fetch all dynamic content in parallel
  const [products, collections, brands, blogPosts] = await Promise.all([
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
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/mens`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/womens`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/unisex`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.handle)
    .map((p) => ({
      url: `${baseUrl}/products/${p.handle}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${baseUrl}/collections/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Brand pages
  const brandPages: MetadataRoute.Sitemap = brands
    .filter((b) => b.slug)
    .map((b) => ({
      url: `${baseUrl}/brands/${b.slug}`,
      lastModified: b._updatedAt ? new Date(b._updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.slug && post.category)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.category}/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...staticPages,
    ...productPages,
    ...collectionPages,
    ...brandPages,
    ...blogPages,
  ];
}
