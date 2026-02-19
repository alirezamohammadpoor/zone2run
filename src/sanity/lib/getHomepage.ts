import { previewClient, sanityFetch } from "./client";

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
      alt,
      hotspot
    },
    heroVideo {
      asset-> {
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
  }),
  ...select(_type == "portableTextModule" => {
    contentType,
    layout,
    mediaType,
    mediaPosition,
    mediaHeight,
    productSource,
    productPosition,
    collection {
      _ref,
      _type
    },
    image {
      asset-> {
        url,
        metadata
      },
      alt,
      hotspot
    },
    video {
      asset-> {
        url
      }
    },
    featuredProducts[] {
      ...,
      imageSelection,
      product {
        _ref,
        _type
      }
    },
    featuredHeading,
    featuredSubheading,
    displayType,
    displayTypeDesktop,
    productCount,
    featuredButtonLink,
    featuredButtonText
  })
}`;

// Shared projection for homepage version documents
const homepageProjection = `{
  _id,
  title,
  ${modulesProjection},
  seo {
    ...
  }
}`;

export async function getHomepage(region?: string, preview = false) {
  // Market-specific: try region override first, fall back to default
  const marketQuery = `*[_id == "siteSettings"][0] {
    "homepage": coalesce(
      marketHomepages[region == $region][0].homepage->${homepageProjection},
      activeHomepage->${homepageProjection}
    )
  }.homepage`;

  // Default: no region, use activeHomepage directly
  const defaultQuery = `*[_id == "siteSettings"][0] {
    activeHomepage->${homepageProjection}
  }.activeHomepage`;

  const query = region ? marketQuery : defaultQuery;
  const params = region ? { region } : {};

  // Fallback to old home singleton if siteSettings doesn't exist
  const fallbackQuery = `*[_type == "home"][0] ${homepageProjection}`;

  try {
    if (preview) {
      const homepage = await previewClient.fetch(query, params);
      if (homepage) return homepage;
      return await previewClient.fetch(fallbackQuery);
    }

    const homepage = await sanityFetch<unknown>(query, params);
    if (homepage) return homepage;

    return await sanityFetch<unknown>(fallbackQuery);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}
