import { client } from "@/sanity/lib/client";

export async function getMenu() {
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
    const menu = await client.fetch(query);
    return menu || null;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return null;
  }
}

