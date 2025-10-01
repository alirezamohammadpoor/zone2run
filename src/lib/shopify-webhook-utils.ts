import { createClient } from "@sanity/client";
import { createHash } from "crypto";

// Sanity client for webhook operations
export const webhookSanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
  apiVersion: "2023-05-03",
});

// Image optimization settings
export const IMAGE_OPTIMIZATION = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  format: "webp" as const,
};

// Helper function to create optimized image URL
export function createOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  const { width, height, quality, format } = {
    ...IMAGE_OPTIMIZATION,
    ...options,
  };

  // For Shopify images, we can use their image transformation API
  if (originalUrl.includes("cdn.shopify.com")) {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split("/");
    const filename = pathParts[pathParts.length - 1];
    const baseUrl = url.origin + pathParts.slice(0, -1).join("/");

    return `${baseUrl}/${width}x${height}/crop=center,quality=${quality},format=${format}/${filename}`;
  }

  return originalUrl;
}

// Helper function to generate unique filename
export function generateImageFilename(
  imageUrl: string,
  productId: string,
  index: number = 0
): string {
  const urlHash = createHash("md5")
    .update(imageUrl)
    .digest("hex")
    .substring(0, 8);
  const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
  return `product-${productId}-${index}-${urlHash}.${extension}`;
}

// Helper function to validate image URL
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "https:" &&
      (parsedUrl.hostname.includes("cdn.shopify.com") ||
        parsedUrl.hostname.includes("shopify.com"))
    );
  } catch {
    return false;
  }
}

// Helper function to get image dimensions from URL
export async function getImageDimensions(
  imageUrl: string
): Promise<{ width: number; height: number } | null> {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) return null;

    // For Shopify images, we can extract dimensions from the URL
    if (imageUrl.includes("cdn.shopify.com")) {
      const match = imageUrl.match(/(\d+)x(\d+)/);
      if (match) {
        return {
          width: parseInt(match[1]),
          height: parseInt(match[2]),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
