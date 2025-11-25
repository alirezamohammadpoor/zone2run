import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// Create a non-CDN client for fetching latest data without cache
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN to get latest published data immediately
});

export async function getHomepage() {
  const query = `*[_type == "home"][0] {
    _id,
    title,
    modules[] {
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
    },
    seo {
      ...
    }
  }`;

  try {
    return await liveClient.fetch(query);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}

