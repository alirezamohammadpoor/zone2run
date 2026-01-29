import type { SanityProduct } from "@/types/sanityProduct";

/**
 * Get the selected image for a product based on imageSelection string.
 * Supports "main" for main image (images[0]), or "gallery_N" for gallery index N (images[N+1]).
 */
export function getSelectedImage(
  product: SanityProduct | undefined,
  imageSelection: string = "main"
): { url: string; alt: string } {
  if (!product) {
    return { url: "", alt: "Product" };
  }

  const mainImage = product.images?.[0];

  if (imageSelection === "main" || !imageSelection) {
    return {
      url: mainImage?.url || "",
      alt: mainImage?.alt || product.title || "Product",
    };
  }

  if (imageSelection.startsWith("gallery_")) {
    const index = parseInt(imageSelection.split("_")[1]);
    // gallery_N maps to images[N+1] since images[0] is the main image
    const galleryImage = product.images?.[index + 1];
    if (galleryImage?.url) {
      return {
        url: galleryImage.url,
        alt: galleryImage.alt || product.title || "Product",
      };
    }
  }

  // Fallback to main image
  return {
    url: mainImage?.url || "",
    alt: mainImage?.alt || product.title || "Product",
  };
}
