import { cache } from "react";
import { sanityFetch } from "@/sanity/lib/live";
import type { EditorialImage } from "./groqUtils";

interface Brand {
  _id: string;
  name: string;
  slug: { current: string };
  logo?: { asset: { url: string } };
  productCount: number;
  featured?: boolean;
  description?: string;
  heroImage?: EditorialImage;
  editorialImages?: EditorialImage[];
}

export async function getAllBrands() {
  const query = `*[_type == "brand"] {
    _id,
    name,
    slug {
      current
    },
    logo {
      asset-> {
        url
      }
    },
    "productCount": count(*[_type == "product" && references(^._id)]),
    featured
  } | order(name asc)`;

  try {
    const { data } = await sanityFetch({ query });
    return data as Brand[];
  } catch (error) {
    console.error("Error fetching all brands:", error);
    return [];
  }
}

export const getBrandBySlug = cache(async (slug: string) => {
  const query = `*[_type == "brand" && slug.current == $slug][0] {
    _id,
    name,
    description,
    heroImage {
      _key,
      image {
        asset-> {
          _id,
          url,
          metadata {
            lqip
          }
        },
        alt
      },
      caption
    },
    editorialImages[] {
      _key,
      image {
        asset-> {
          _id,
          url,
          metadata {
            lqip
          }
        },
        alt
      },
      caption
    }
  }`;

  try {
    const { data } = await sanityFetch({ query, params: { slug } });
    return data as Brand | null;
  } catch (error) {
    console.error(`Error fetching brand ${slug}:`, error);
    return null;
  }
});

