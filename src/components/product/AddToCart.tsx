"use client";
import { memo, useState, useTransition, useCallback } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useUIStore } from "@/lib/cart/uiStore";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";
import type { ShopifyProduct } from "@/types/shopify";

type ShopifyVariant = ShopifyProduct["variants"][number];

interface AddToCartProps {
  staticProduct: SanityProduct;
  variants: ShopifyVariant[];
}

/**
 * Add to Cart button using Shopify variant data.
 * The selectedVariant comes from Zustand (set by VariantSelector).
 * We verify the variant exists in Shopify data before adding.
 */
const AddToCart = memo(function AddToCart({
  staticProduct,
  variants,
}: AddToCartProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [, startTransition] = useTransition();
  const addItem = useCartStore((state) => state.addItem);
  const showAddedToCart = useUIStore((state) => state.showAddedToCart);
  const { selectedVariant } = useProductStore();

  // Find the Shopify variant data for the selected variant
  const shopifyVariant = selectedVariant
    ? variants.find((v) => v.id === selectedVariant.id)
    : null;

  // Use Shopify availability status
  const isAvailable = shopifyVariant?.availableForSale ?? false;
  const price = shopifyVariant?.price.amount ?? selectedVariant?.price ?? 0;

  const handleClick = useCallback(() => {
    if (!selectedVariant || !shopifyVariant || isAdded || !isAvailable) return;

    // Immediate UI feedback
    setIsAdded(true);

    // Defer heavy operations
    startTransition(() => {
      addItem({
        id: shopifyVariant.id,
        variantId: shopifyVariant.id,
        productHandle: staticProduct.handle,
        title: staticProduct.title,
        price: {
          amount: price,
          currencyCode: "SEK",
        },
        image: staticProduct.mainImage?.url || "",
        color: selectedVariant.color ?? "",
        size: selectedVariant.size,
        brand: staticProduct.brand?.name || staticProduct.vendor,
      });

      showAddedToCart({
        brand: staticProduct.brand?.name || staticProduct.vendor,
        title: staticProduct.title,
        image: staticProduct.mainImage?.url || "",
        size: selectedVariant.size,
        color: selectedVariant.color ?? "",
        price: price,
        currencyCode: "SEK",
      });
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  }, [
    selectedVariant,
    shopifyVariant,
    isAdded,
    isAvailable,
    price,
    staticProduct,
    addItem,
    showAddedToCart,
  ]);

  // Determine button state
  const getButtonState = () => {
    if (!selectedVariant) {
      return { text: "SELECT SIZE", disabled: true, className: "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300" };
    }
    // Only show OUT OF STOCK if we found the variant AND it's not available
    if (shopifyVariant && !shopifyVariant.availableForSale) {
      return { text: "OUT OF STOCK", disabled: true, className: "bg-red-500 text-white cursor-not-allowed border border-red-500" };
    }
    if (isAdded) {
      return { text: "ADDED TO CART", disabled: true, className: "bg-green-500 text-white cursor-pointer" };
    }
    return { text: "ADD TO CART", disabled: false, className: "bg-black text-white cursor-pointer" };
  };

  const buttonState = getButtonState();

  return (
    <div className="mt-4">
      <button
        className={`w-full h-[50px] text-xs transition-colors duration-300 ease-in-out ${buttonState.className}`}
        onClick={handleClick}
        disabled={buttonState.disabled}
      >
        {buttonState.text}
      </button>
    </div>
  );
});

export default AddToCart;
