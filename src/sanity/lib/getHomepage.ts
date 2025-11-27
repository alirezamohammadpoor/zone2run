import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// Create a non-CDN client for fetching latest data without cache
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN to get latest published data immediately
});

// Shared modules projection for both queries
const modulesProjection = `modules[] {
  _key,
  _type,
  ...,
  ...select(_type == "featuredProductsModule" => {
    featuredProducts[] {
      ...,
      imageSelection,
      product {
        _ref,
        _type
      }
    }
  }),
  ...select(_type == "editorialModule" => {
    featuredPosts[] {
      ...,
      post-> {
        _id,
        title,
        slug {
          current
        },
        excerpt,
        publishedAt,
        author,
        readingTime,
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
        }
      }
    }
  }),
  ...select(_type == "heroModule" => {
    heroImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    heroVideo {
      asset-> {
        _ref,
        url
      }
    }
  }),
  ...select(_type == "imageModule" => {
    image {
      asset-> {
        url,
        metadata
      },
      alt
    },
    video {
      asset-> {
        url
      }
    },
    content
  })
}`;

export async function getHomepage() {
  // First try to get homepage via siteSettings (new system)
  // Use _id == "siteSettings" to target the singleton specifically
  const siteSettingsQuery = `*[_id == "siteSettings"][0] {
    activeHomepage-> {
      _id,
      title,
      ${modulesProjection},
      seo {
        ...
      }
    }
  }.activeHomepage`;

  // Fallback to old home singleton if siteSettings doesn't exist
  const fallbackQuery = `*[_type == "home"][0] {
    _id,
    title,
    ${modulesProjection},
    seo {
      ...
    }
  }`;

  try {
    // Try new system first
    const homepage = await liveClient.fetch(siteSettingsQuery);
    
    if (homepage) {
      return homepage;
    }
    
    // Fallback to old system during migration
    return await liveClient.fetch(fallbackQuery);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}
