import type { SanityProduct } from "@/types/sanityProduct";

/**
 * Get the selected image for a product based on imageSelection string.
 * Supports "main" for main image, or "gallery_N" for gallery index N.
 */
export function getSelectedImage(
  product: SanityProduct | undefined,
  imageSelection: string = "main"
): { url: string; alt: string } {
  if (!product) {
    return { url: "", alt: "Product" };
  }

  if (imageSelection === "main" || !imageSelection) {
    return {
      url: product.mainImage?.url || "",
      alt: product.mainImage?.alt || product.title || "Product",
    };
  }

  if (imageSelection.startsWith("gallery_")) {
    const index = parseInt(imageSelection.split("_")[1]);
    const galleryImage = product.gallery?.[index];
    if (galleryImage?.url) {
      return {
        url: galleryImage.url,
        alt: galleryImage.alt || product.title || "Product",
      };
    }
  }

  // Fallback to main image
  return {
    url: product.mainImage?.url || "",
    alt: product.mainImage?.alt || product.title || "Product",
  };
}
