import { unstable_cache } from "next/cache";
import { client } from "./client";
import type {
  MenuData,
  MenuConfig,
  BrandMenuItem,
  BlogPostMenuItem,
  SubcategoryMenuItem,
} from "@/types/menu";

// CDN client for published header data — faster on cold cache
const cdnClient = client.withConfig({ useCdn: true });

// Result shape from the unified GROQ query
interface RawHeaderQueryResult {
  categories: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    subcategories: SubcategoryMenuItem[];
  }>;
  navigationMenu: MenuConfig | null;
  brands: BrandMenuItem[];
  blogPosts: BlogPostMenuItem[];
}

// Target shape matching Header component props
interface HeaderData {
  menuData: MenuData;
  brands: BrandMenuItem[];
  menuConfig: MenuConfig | undefined;
  blogPosts: BlogPostMenuItem[];
}

const HEADER_QUERY = `{
  "categories": *[_type == "category" && categoryType == "main"] | order(sortOrder asc, title asc) {
    _id,
    title,
    slug { current },
    "subcategories": *[_type == "category" && categoryType == "subcategory" && parentCategory._ref == ^._id] | order(title asc) {
      _id,
      title,
      slug { current },
      categoryType,
      "parentCategory": { "title": ^.title, "slug": ^.slug },
      "subSubcategories": *[_type == "category" && categoryType == "specific" && parentCategory._ref == ^._id] | order(sortOrder asc, title asc) {
        _id,
        title,
        slug { current },
        description,
        sortOrder,
        "parentCategory": { "_id": ^._id, "title": ^.title, "slug": ^.slug }
      }
    }
  },
  "navigationMenu": *[_type == "navigationMenu"][0] {
    men {
      featuredCollections[]-> {
        _id,
        "title": store.title,
        "slug": store.slug { current },
        menuImage { asset-> { _id, url }, alt }
      }
    },
    women {
      featuredCollections[]-> {
        _id,
        "title": store.title,
        "slug": store.slug { current },
        menuImage { asset-> { _id, url }, alt }
      }
    },
    help { links[] { label, url, _key } },
    "ourSpace": ourSpace { links[] { label, url, _key } }
  },
  "brands": *[_type == "brand"] | order(name asc) {
    _id,
    name,
    slug { current },
    logo { asset-> { url } },
    featured
  },
  "blogPosts": *[_type == "blogPost"] | order(publishedAt desc) [0...10] {
    _id,
    title,
    slug { current },
    category-> { title, slug { current } },
    featuredImage { asset-> { url, "lqip": metadata.lqip }, alt }
  }
}`;

function transformCategoryArray(
  categories: RawHeaderQueryResult["categories"]
): { [slug: string]: SubcategoryMenuItem[] } {
  const result: Record<string, SubcategoryMenuItem[]> = {};
  for (const cat of categories || []) {
    if (cat.slug?.current) {
      result[cat.slug.current] = cat.subcategories || [];
    }
  }
  return result;
}

const EMPTY_HEADER: HeaderData = {
  menuData: { men: {}, women: {} },
  brands: [],
  menuConfig: undefined,
  blogPosts: [],
};

/**
 * Cached header data — single GROQ query, cached via unstable_cache.
 * Uses client.fetch (NOT sanityFetch from defineLive) to avoid dual-cache conflict.
 * Revalidated on-demand via revalidateTag("header-data") from the revalidation webhook.
 *
 * Content types that trigger revalidation: brand, navigationMenu, category, blogPost, collection.
 * If a new content type affects the header, add it to HEADER_CONTENT_TYPES in /api/revalidate/route.ts.
 */
export const getCachedHeaderData = unstable_cache(
  async (): Promise<HeaderData> => {
    try {
      const data = await cdnClient.fetch<RawHeaderQueryResult>(HEADER_QUERY);
      const categoryMap = transformCategoryArray(data.categories);
      return {
        menuData: { men: categoryMap, women: categoryMap },
        brands: data.brands ?? [],
        menuConfig: data.navigationMenu ?? undefined,
        blogPosts: data.blogPosts ?? [],
      };
    } catch (error) {
      console.error("Failed to fetch header data:", error);
      return EMPTY_HEADER;
    }
  },
  ["header-data"],
  { tags: ["header-data"] }
);
