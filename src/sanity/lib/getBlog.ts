import { sanityFetch } from "@/sanity/lib/client";
import { buildLimitClause } from "./groqUtils";

// BlogPost type for listing queries (getBlogPosts)
interface BlogPostListing {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  readingTime?: number;
  category?: { title: string; slug: { current: string } };
  featuredImage?: { asset: { url: string; metadata?: unknown }; alt?: string };
  editorialImage?: { asset: { url: string; metadata?: unknown }; alt?: string };
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
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
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
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
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
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
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
        metadata
      },
      alt
    },
    editorialImage {
      asset-> {
        url,
        metadata
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
            "mainImage": {
              "url": coalesce(mainImage.asset->url, store.previewImageUrl),
              "alt": coalesce(mainImage.alt, store.title)
            },
            "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
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
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
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

