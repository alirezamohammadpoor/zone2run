// lib/types/product.ts
import type { ShopifyProduct } from "./shopify";
import type { SanityProduct } from "./sanity";

export interface Product {
  // Core combined data
  shopify: ShopifyProduct;
  sanity: SanityProduct;
}

// Helper class for product operations
export class ProductHelper {
  constructor(private product: Product) {}

  getMainImage(): string | null {
    const { sanity, shopify } = this.product;

    // Priority: Sanity main image -> Shopify featured image -> first variant image
    if (sanity.mainImage?.asset?.url) {
      return sanity.mainImage.asset.url;
    }
    if (shopify.featuredImage?.url) {
      return shopify.featuredImage.url;
    }
    return shopify.variants[0]?.image?.url || null;
  }

  getGalleryImages(): Array<{ url: string; alt?: string }> {
    const { sanity, shopify } = this.product;
    const images: Array<{ url: string; alt?: string }> = [];

    // Add Sanity main image first
    if (sanity.mainImage?.asset?.url) {
      images.push({
        url: sanity.mainImage.asset.url,
        alt: sanity.mainImage.alt,
      });
    }

    // Add Shopify images that aren't already included
    const sanityUrls = new Set(images.map((img) => img.url));
    shopify.images.forEach((img) => {
      if (!sanityUrls.has(img.url)) {
        images.push({ url: img.url, alt: img.altText });
      }
    });

    return images;
  }

  getPrice() {
    const { shopify } = this.product;
    return {
      amount: shopify.priceRange.minVariantPrice.amount,
      currencyCode: shopify.priceRange.minVariantPrice.currencyCode,
    };
  }

  getAvailableSizes(): string[] {
    const { shopify } = this.product;
    return shopify.variants
      .filter((variant) => variant.availableForSale && variant.size)
      .map((variant) => variant.size!)
      .filter((size, index, arr) => arr.indexOf(size) === index); // unique
  }

  getDisplayTitle(): string {
    const { sanity, shopify } = this.product;
    // Use Sanity title (with brand) for display, fallback to Shopify title
    return sanity.title || shopify.title;
  }

  getBrandName(): string | null {
    const { sanity } = this.product;
    // Extract brand from Sanity title (e.g., "Distance Lab - LT Windbreaker" -> "Distance Lab")
    if (sanity.title && sanity.title.includes(" - ")) {
      return sanity.title.split(" - ")[0];
    }
    return sanity.brand?.name || null;
  }

  getProductName(): string {
    const { sanity, shopify } = this.product;
    // Extract product name from Sanity title (e.g., "Distance Lab - LT Windbreaker" -> "LT Windbreaker")
    if (sanity.title && sanity.title.includes(" - ")) {
      return sanity.title.split(" - ")[1];
    }
    return shopify.title;
  }

  getBreadcrumbs(): Array<{ label: string; href?: string }> {
    const { sanity, shopify } = this.product;
    const breadcrumbs = [{ label: "Home", href: "/" }];

    // Add category from Sanity
    if (sanity.category?.title) {
      breadcrumbs.push({
        label: sanity.category.title,
        href: `/category/${sanity.category.slug?.current}`,
      });
    }

    // Add current product
    breadcrumbs.push({
      label: this.getDisplayTitle(),
      href: `/products/${shopify.handle}`,
    });

    return breadcrumbs;
  }
}

// Helper function to create the Product object
export function createProduct(
  shopify: ShopifyProduct,
  sanity: SanityProduct
): Product {
  return {
    shopify,
    sanity,
  };
}
