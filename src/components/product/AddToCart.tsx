"use client";
import React, { memo, useState, useTransition, useCallback } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useUIStore } from "@/lib/cart/uiStore";
import { Variant } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";

interface AddToCartProps {
  product: SanityProduct;
  selectedVariant: Variant | null;
}

const AddToCart = memo(function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const addItem = useCartStore((state) => state.addItem);
  const showAddedToCart = useUIStore((state) => state.showAddedToCart);

  const handleClick = useCallback(() => {
    if (!selectedVariant || isAdded) return;

    // Immediate UI feedback (fast - updates before next paint)
    setIsAdded(true);

    // Defer heavy operations to avoid blocking INP
    startTransition(() => {
      addItem({
        id: `${product.handle}-${selectedVariant.size}`,
        variantId: selectedVariant.id,
        productHandle: product.handle,
        title: product.title,
        price: {
          amount: selectedVariant.price ?? 0,
          currencyCode: "SEK",
        },
        image: product.mainImage?.url || "",
        color: selectedVariant.color ?? "",
        size: selectedVariant.size,
        brand: product.brand?.name || product.vendor,
      });

      showAddedToCart({
        brand: product.brand?.name || product.vendor,
        title: product.title,
        image: product.mainImage?.url || "",
        size: selectedVariant.size,
        color: selectedVariant.color ?? "",
        price: selectedVariant.price ?? 0,
        currencyCode: "SEK",
      });
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  }, [selectedVariant, isAdded, product, addItem, showAddedToCart]);

  return (
    <div className="mt-4">
      <button
        className={`
            w-full h-[50px] text-xs transition-colors duration-300 ease-in-out
            ${
              !selectedVariant
                ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
                : !selectedVariant.available
                ? "bg-red-500 text-white cursor-not-allowed border border-red-500"
                : isAdded
                ? "bg-green-500 text-white cursor-pointer"
                : "bg-black text-white cursor-pointer"
            }
          `}
        onClick={handleClick}
        disabled={!selectedVariant || !selectedVariant.available || isAdded}
      >
        {!selectedVariant
          ? "SELECT SIZE"
          : !selectedVariant.available
          ? "OUT OF STOCK"
          : isAdded
          ? "ADDED TO CART"
          : "ADD TO CART"}
      </button>
    </div>
  );
});

export default AddToCart;
