/**
 * Helper to get blur placeholder props for Next.js Image component
 * Works with Sanity images that have metadata.lqip
 */

interface ImageWithLqip {
  url?: string;
  alt?: string;
  lqip?: string;
  asset?: {
    url?: string;
    metadata?: {
      lqip?: string;
    };
  };
}

interface BlurPlaceholderProps {
  placeholder: "blur" | "empty";
  blurDataURL?: string;
}

/**
 * Get blur placeholder props from a Sanity image with LQIP metadata
 * @param image - Sanity image object with lqip field or nested asset.metadata.lqip
 * @returns Object with placeholder and blurDataURL props for Next.js Image
 */
export function getBlurProps(image?: ImageWithLqip | null): BlurPlaceholderProps {
  // Direct lqip field (from groqUtils projections)
  if (image?.lqip) {
    return {
      placeholder: "blur",
      blurDataURL: image.lqip,
    };
  }

  // Nested metadata.lqip (from homepage/blog queries)
  if (image?.asset?.metadata?.lqip) {
    return {
      placeholder: "blur",
      blurDataURL: image.asset.metadata.lqip,
    };
  }

  return {
    placeholder: "empty",
  };
}
