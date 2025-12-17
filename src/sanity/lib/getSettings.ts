import { client } from "./client";

export async function getNotFoundPage() {
  const query = `*[_type == "settings"][0].notFoundPage {
    title,
    body,
    image {
      asset-> { url },
      alt,
      hotspot
    },
    buttons[] {
      text,
      link
    }
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching 404 page settings:", error);
    return null;
  }
}
