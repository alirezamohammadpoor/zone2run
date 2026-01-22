import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { SanityProduct } from "@/types/sanityProduct";
import type { ShopifyProduct } from "@/types/shopify";

interface ProductFormProps {
  staticProduct: SanityProduct;
  shopifyProduct: ShopifyProduct | null;
}

/**
 * Server Component that displays fresh variant data from Shopify.
 * Shopify data is fetched in parallel with Sanity data at the page level.
 *
 * This ensures users always see accurate:
 * - Price (not cached from Sanity)
 * - Stock status (real-time availability)
 * - Variant options (in case they changed)
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

  const price = shopifyProduct.priceRange.minVariantPrice;
  const compareAtPrice = shopifyProduct.priceRange.maxVariantPrice;
  const hasDiscount = compareAtPrice.amount > price.amount;

  return (
    <>
      {/* Fresh price from Shopify */}
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs">
          {formatPrice(price.amount)} {price.currencyCode}
        </p>
        {hasDiscount && (
          <p className="text-xs text-gray-400 line-through">
            {formatPrice(compareAtPrice.amount)} {compareAtPrice.currencyCode}
          </p>
        )}
      </div>

      {/* Fresh variants from Shopify */}
      <VariantSelector variants={shopifyProduct.variants} />

      {/* Add to cart with fresh variant data */}
      <AddToCart
        staticProduct={staticProduct}
        variants={shopifyProduct.variants}
      />
    </>
  );
}

/**
 * Fallback when Shopify API fails - uses cached Sanity data
 * This ensures the page still works even if Shopify is down
 */
function ProductFormFallback({ product }: { product: SanityProduct }) {
  const price = product.priceRange.minVariantPrice;

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

  return (
    <>
      <p className="text-xs mt-1">
        {formatPrice(price)} SEK
      </p>
      <VariantSelector variants={variants} />
      <AddToCart staticProduct={product} variants={variants} />
    </>
  );
}
