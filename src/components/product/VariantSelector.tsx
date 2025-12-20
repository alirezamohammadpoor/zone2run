"use client";
import React, { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";

interface VariantSelectorProps {
  product: SanityProduct;
}

function VariantSelector({ product }: VariantSelectorProps) {
  const { selectedVariant, setSelectedVariant } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);

  // Get all unique sizes (both available and unavailable)
  const allSizes =
    product.variants
      ?.filter((variant) =>
        variant.selectedOptions.some((opt) => opt.name === "Size")
      )
      .map(
        (variant) =>
          variant.selectedOptions.find((opt) => opt.name === "Size")?.value
      )
      .filter((size, index, arr) => size && arr.indexOf(size) === index) || [];

  // Get available sizes for comparison
  const availableSizes =
    product.variants
      ?.filter(
        (variant) =>
          variant.available &&
          variant.selectedOptions.some((opt) => opt.name === "Size")
      )
      .map(
        (variant) =>
          variant.selectedOptions.find((opt) => opt.name === "Size")?.value
      )
      .filter((size, index, arr) => size && arr.indexOf(size) === index) || [];

  return (
    <div className="mt-6">
      <div
        className={`grid gap-2 ${
          allSizes.length === 1 && allSizes[0]?.toLowerCase() === "one size"
            ? "grid-cols-1"
            : "grid-cols-5"
        }`}
      >
        {allSizes.map((size) => {
          const isAvailable = availableSizes.includes(size);
          const isSelected = selectedVariant?.size === size;
          const isOneSize =
            size?.toLowerCase() === "one size" ||
            size?.toLowerCase() === "onesize";

          return (
            <button
              key={size}
              className={`py-1 px-4 border text-center text-xs transition-colors ${
                isOneSize ? "w-full" : ""
              } ${
                !isAvailable
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : isSelected
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:bg-black hover:text-white hover:border-black"
              }`}
              onClick={() => {
                if (!isAvailable) return; // Prevent selection of unavailable variants

                // Find the correct variant for this size
                const variant = product.variants?.find(
                  (variant) =>
                    variant.selectedOptions.find((opt) => opt.name === "Size")
                      ?.value === size && variant.available
                );

                if (variant && size) {
                  setSelectedVariant({
                    size,
                    id: variant.id,
                    available: variant.available,
                    title: variant.title,
                    price: variant.price,
                    color:
                      variant.selectedOptions.find(
                        (opt) => opt.name === "Color"
                      )?.value || "",
                  });
                }
              }}
              disabled={!isAvailable}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VariantSelector;
