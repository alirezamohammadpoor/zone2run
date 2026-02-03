import { sanityFetch } from "@/sanity/lib/client";
import { buildLimitClause } from "./groqUtils";
import type { BlogPostMenuItem } from "@/types/menu";

// BlogPost type for listing queries (getBlogPosts)
export interface BlogPostListing {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  readingTime?: number;
  category?: { title: string; slug: { current: string } };
  featuredImage?: { asset: { url: string; lqip?: string }; alt?: string };
  editorialImage?: { asset: { url: string; lqip?: string }; alt?: string };
  productsModule?: unknown;
  featuredProductsModule?: unknown;
  productShowcaseModule?: unknown;
}


export async function getBlogPosts(limit?: number) {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug {
      current
    },
    productsModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name },
          "images": [{
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title),
            "lqip": mainImage.asset->metadata.lqip
          }] + coalesce(gallery[] { "url": asset->url, "alt": coalesce(alt, ^.title), "lqip": asset->metadata.lqip }, [])
        }
      }
    },
    featuredProductsModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name },
          "images": [{
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title),
            "lqip": mainImage.asset->metadata.lqip
          }] + coalesce(gallery[] { "url": asset->url, "alt": coalesce(alt, ^.title), "lqip": asset->metadata.lqip }, [])
        }
      }
    },
    productShowcaseModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name },
          "images": [{
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title),
            "lqip": mainImage.asset->metadata.lqip
          }] + coalesce(gallery[] { "url": asset->url, "alt": coalesce(alt, ^.title), "lqip": asset->metadata.lqip }, [])
        }
      }
    },
    excerpt,
    publishedAt,
    author,
    category-> {
      title,
      slug {
        current
      }
    },
    featuredImage {
      asset-> {
        url,
        "lqip": metadata.lqip
      },
      alt
    },
    editorialImage {
      asset-> {
        url,
        "lqip": metadata.lqip
      },
      alt
    },
    readingTime
  }${buildLimitClause(limit)}`;

  try {
    return await sanityFetch<BlogPostListing[]>(query);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

/**
 * Lean blog query for header/menu — only fetches fields rendered in the dropdown.
 * Drops productsModule, featuredProductsModule, productShowcaseModule, editorialImage,
 * excerpt, author, readingTime which are never used in the header UI.
 */
export async function getBlogPostsForMenu(
  limit: number = 10,
): Promise<BlogPostMenuItem[]> {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug { current },
    category-> { title, slug { current } },
    featuredImage {
      asset-> { url, "lqip": metadata.lqip },
      alt
    }
  }[0...${limit}]`;

  try {
    return await sanityFetch<BlogPostMenuItem[]>(query);
  } catch (error) {
    console.error("Error fetching blog posts for menu:", error);
    return [];
  }
}

export async function getBlogPost(slug: string) {
  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    ...,
    _id,
    title,
    slug { current },
    content[] {
      ...,
      _type == "image" => {
        ...,
        asset-> { url, metadata }
      },
      _type == "blogProductsModule" => {
        ...,
        featuredProducts[] {
          ...,
          product-> {
            _id,
            "title": coalesce(title, store.title),
            "handle": coalesce(shopifyHandle, store.slug.current),
            brand-> { _id, name, "slug": slug.current },
            "priceRange": {
              "minVariantPrice": store.priceRange.minVariantPrice,
              "maxVariantPrice": store.priceRange.maxVariantPrice
            },
            "images": [{
              "url": coalesce(mainImage.asset->url, store.previewImageUrl),
              "alt": coalesce(mainImage.alt, store.title)
            }] + coalesce(gallery[] { "url": asset->url, "alt": coalesce(alt, ^.title) }, [])
          }
        }
      }
    },
    excerpt,
    publishedAt,
    author,
    readingTime,
    mediaType,
    category-> { title, slug { current } },
    featuredImage { asset-> { url, metadata }, alt, hotspot, crop },
    featuredVideo { asset-> { url, metadata } },
    heroHeight,
    productsModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name, "slug": slug.current },
          "priceRange": {
            "minVariantPrice": store.priceRange.minVariantPrice,
            "maxVariantPrice": store.priceRange.maxVariantPrice
          },
          "images": [{
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title),
            "lqip": mainImage.asset->metadata.lqip
          }] + coalesce(gallery[] { "url": asset->url, "alt": coalesce(alt, ^.title), "lqip": asset->metadata.lqip }, [])
        }
      }
    },
    featuredCollection-> {
      _id,
      title,
      "slug": slug.current,
      store {
        gid,
        title,
        slug {
          current
        }
      }
    },
    featuredCollectionLimit,
    featuredCollectionDisplayType
  }`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const post = await sanityFetch<any>(query, { slug });
    return post;
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}

