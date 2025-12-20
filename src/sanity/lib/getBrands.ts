import { client } from "@/sanity/lib/client";

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
    return await client.fetch(query);
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
    editorialImages[] {
      _key,
      image {
        asset-> {
          _id,
          url
        },
        alt
      },
      caption
    }
  }`;

  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error(`Error fetching brand ${slug}:`, error);
    return null;
  }
}

