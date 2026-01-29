import type { SanityProduct } from "@/types/sanityProduct";
import type { PLPProduct } from "@/types/plpProduct";

/**
 * Extracts unique sizes from product variants.
 * Looks for "Size" option or falls back to first option.
 */
function extractSizes(variants: SanityProduct["variants"]): string[] {
  if (!variants || variants.length === 0) return [];

  const sizes = new Set<string>();

  for (const variant of variants) {
    if (!variant.selectedOptions) continue;

    // Look for Size option first
    const sizeOption = variant.selectedOptions.find(
      (opt) => opt.name.toLowerCase() === "size"
    );

    if (sizeOption?.value) {
      sizes.add(sizeOption.value);
    } else if (variant.selectedOptions[0]?.value) {
      // Fallback to first option
      sizes.add(variant.selectedOptions[0].value);
    }
  }

  return Array.from(sizes);
}

/**
 * Transforms a full SanityProduct into a minimal PLPProduct.
 * Extracts only fields needed for PLP rendering and filtering.
 */
export function mapToMinimalProduct(product: SanityProduct): PLPProduct {
  return {
    _id: product._id,
    title: product.title,
    handle: product.handle,
    vendor: product.vendor || product.brand?.name || "",
    images: [{
      url: product.images?.[0]?.url || "",
      alt: product.images?.[0]?.alt || product.title,
      lqip: product.images?.[0]?.lqip,
    }],
    priceRange: {
      minVariantPrice: product.priceRange?.minVariantPrice || 0,
      maxVariantPrice: product.priceRange?.maxVariantPrice,
    },
    sizes: extractSizes(product.variants),
    brand: {
      name: product.brand?.name || "",
      slug: product.brand?.slug || "",
    },
    category: {
      title: product.category?.title || "",
      slug: product.category?.slug || "",
    },
    gender: product.gender,
    _createdAt: product._createdAt,
  };
}

/**
 * Transforms an array of SanityProducts into PLPProducts.
 */
export function mapToMinimalProducts(products: SanityProduct[]): PLPProduct[] {
  return products.map(mapToMinimalProduct);
}
