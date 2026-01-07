import { sanityFetch } from "@/sanity/lib/client";
import type { MenuConfig } from "@/types/menu";

export async function getMenu(): Promise<MenuConfig | undefined> {
  const query = `*[_type == "navigationMenu"][0] {
    men {
      featuredCollections[]-> {
        _id,
        "title": store.title,
        "slug": store.slug {
          current
        },
        menuImage {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    },
    women {
      featuredCollections[]-> {
        _id,
        "title": store.title,
        "slug": store.slug {
          current
        },
        menuImage {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    },
    help {
      links[] {
        label,
        url,
        _key
      }
    },
    "ourSpace": ourSpace {
      links[] {
        label,
        url,
        _key
      }
    }
  }`;

  try {
    const menu = await sanityFetch<MenuConfig | undefined>(query);
    return menu || undefined;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return undefined;
  }
}

