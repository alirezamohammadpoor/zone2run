"use client";
import React, { memo, useState, useTransition, useCallback } from "react";
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
 * Add to Cart button that uses fresh variant data from Shopify.
 * The selectedVariant comes from Zustand (set by VariantSelector).
 * We verify the variant still exists in fresh data before adding.
 */
const AddToCart = memo(function AddToCart({
  staticProduct,
  variants,
}: AddToCartProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const addItem = useCartStore((state) => state.addItem);
  const showAddedToCart = useUIStore((state) => state.showAddedToCart);
  const { selectedVariant } = useProductStore();

  // Find the FRESH variant data for the selected variant
  const freshVariant = selectedVariant
    ? variants.find((v) => v.id === selectedVariant.id)
    : null;

  // Use fresh availability status
  const isAvailable = freshVariant?.availableForSale ?? false;
  const freshPrice = freshVariant?.price.amount ?? selectedVariant?.price ?? 0;

  const handleClick = useCallback(() => {
    if (!selectedVariant || !freshVariant || isAdded || !isAvailable) return;

    // Immediate UI feedback
    setIsAdded(true);

    // Defer heavy operations
    startTransition(() => {
      addItem({
        id: `${staticProduct.handle}-${selectedVariant.size}`,
        variantId: freshVariant.id, // Use fresh Shopify variant ID
        productHandle: staticProduct.handle,
        title: staticProduct.title,
        price: {
          amount: freshPrice, // Use FRESH price from Shopify
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
        price: freshPrice,
        currencyCode: "SEK",
      });
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  }, [
    selectedVariant,
    freshVariant,
    isAdded,
    isAvailable,
    freshPrice,
    staticProduct,
    addItem,
    showAddedToCart,
  ]);

  // Determine button state
  const getButtonState = () => {
    if (!selectedVariant) {
      return { text: "SELECT SIZE", disabled: true, className: "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300" };
    }
    if (!isAvailable) {
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
