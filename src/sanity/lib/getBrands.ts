import { sanityFetch } from "@/sanity/lib/client";
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
    return await sanityFetch<Brand[]>(query);
  } catch (error) {
    console.error("Error fetching all brands:", error);
    return [];
  }
}

export async function getBrandBySlug(slug: string) {
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
    return await sanityFetch<Brand | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching brand ${slug}:`, error);
    return null;
  }
}

