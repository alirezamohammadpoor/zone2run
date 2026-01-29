import VariantSelector from "./VariantSelector";
import AddToCart, { type ProductMeta } from "./AddToCart";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { SanityProduct } from "@/types/sanityProduct";
import type { ShopifyProduct } from "@/types/shopify";

interface ProductFormProps {
  staticProduct: SanityProduct;
  shopifyProduct: ShopifyProduct | null;
}

// Extract minimal product data to reduce serialization payload to client
function extractProductMeta(product: SanityProduct): ProductMeta {
  return {
    handle: product.handle,
    title: product.title,
    imageUrl: product.images?.[0]?.url || "",
    brandName: product.brand?.name || null,
    vendor: product.vendor,
  };
}

/**
 * Returns price element and form elements separately for flexible layout.
 * Price goes inline with title, form elements go below description.
 */
export default function ProductForm({
  staticProduct,
  shopifyProduct,
}: ProductFormProps) {
  // Fallback to Sanity data if Shopify fails (rare edge case)
  if (!shopifyProduct) {
    console.warn(`Shopify product not found, using Sanity fallback`);
    return <ProductFormFallback product={staticProduct} />;
  }

  // Extract only the minimal data needed for cart operations
  const productMeta = extractProductMeta(staticProduct);

  return (
    <>
      {/* Variants from Shopify */}
      <VariantSelector variants={shopifyProduct.variants} />

      {/* Add to cart - receives minimal product data to reduce serialization */}
      <AddToCart
        productMeta={productMeta}
        variants={shopifyProduct.variants}
      />
    </>
  );
}

/**
 * Price component - rendered inline with title
 */
export function ProductPrice({
  shopifyProduct,
  fallbackPrice,
}: {
  shopifyProduct: ShopifyProduct | null;
  fallbackPrice: number;
}) {
  if (!shopifyProduct) {
    return (
      <p className="xl:mt-1 text-xs">
        {formatPrice(fallbackPrice)} SEK
      </p>
    );
  }

  const price = shopifyProduct.priceRange.minVariantPrice;
  const compareAtPrice = shopifyProduct.priceRange.maxVariantPrice;
  const hasDiscount = compareAtPrice.amount > price.amount;

  return (
    <div className="flex items-center gap-2 xl:mt-1">
      <p className="text-xs">
        {formatPrice(price.amount)} {price.currencyCode}
      </p>
      {hasDiscount && (
        <p className="text-xs text-gray-400 line-through">
          {formatPrice(compareAtPrice.amount)} {compareAtPrice.currencyCode}
        </p>
      )}
    </div>
  );
}

/**
 * Fallback when Shopify API fails - uses cached Sanity data
 */
function ProductFormFallback({ product }: { product: SanityProduct }) {
  // Convert Sanity variants to match Shopify shape
  const variants = product.variants?.map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku || "",
    price: { amount: v.price, currencyCode: "SEK" },
    compareAtPrice: v.compareAtPrice
      ? { amount: v.compareAtPrice, currencyCode: "SEK" }
      : undefined,
    availableForSale: v.available,
    selectedOptions: v.selectedOptions,
    size: v.selectedOptions.find((o) => o.name === "Size")?.value,
    color: v.selectedOptions.find((o) => o.name === "Color")?.value,
  })) || [];

  // Extract minimal data for cart operations
  const productMeta = extractProductMeta(product);

  return (
    <>
      <VariantSelector variants={variants} />
      <AddToCart productMeta={productMeta} variants={variants} />
    </>
  );
}
