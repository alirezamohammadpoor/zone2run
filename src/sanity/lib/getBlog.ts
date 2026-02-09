import { sanityFetch } from "@/sanity/lib/client";
import {
  buildLimitClause,
  BLOG_PRODUCT_PROJECTION,
  BLOG_PRODUCT_LISTING_PROJECTION,
} from "./groqUtils";

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
    slug { current },
    productsModule {
      ...,
      featuredProducts[] { ..., ${BLOG_PRODUCT_LISTING_PROJECTION} }
    },
    featuredProductsModule {
      ...,
      featuredProducts[] { ..., ${BLOG_PRODUCT_LISTING_PROJECTION} }
    },
    productShowcaseModule {
      ...,
      featuredProducts[] { ..., ${BLOG_PRODUCT_LISTING_PROJECTION} }
    },
    excerpt,
    publishedAt,
    author,
    category-> { title, slug { current } },
    featuredImage { asset-> { url, "lqip": metadata.lqip }, alt },
    editorialImage { asset-> { url, "lqip": metadata.lqip }, alt },
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
      _type == "image" => { ..., asset-> { url, metadata } },
      _type == "blogProductsModule" => {
        ...,
        featuredProducts[] { ..., ${BLOG_PRODUCT_PROJECTION} }
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
      featuredProducts[] { ..., ${BLOG_PRODUCT_PROJECTION} }
    },
    featuredCollection-> {
      _id,
      title,
      "slug": slug.current,
      store { gid, title, slug { current } }
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
