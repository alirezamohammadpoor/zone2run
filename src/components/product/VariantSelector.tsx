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
  const allSizes = product.variants
    .filter((variant) =>
      variant.selectedOptions.some((opt) => opt.name === "Size")
    )
    .map(
      (variant) =>
        variant.selectedOptions.find((opt) => opt.name === "Size")?.value
    )
    .filter((size, index, arr) => size && arr.indexOf(size) === index);

  // Get available sizes for comparison
  const availableSizes = product.variants
    .filter(
      (variant) =>
        variant.available &&
        variant.selectedOptions.some((opt) => opt.name === "Size")
    )
    .map(
      (variant) =>
        variant.selectedOptions.find((opt) => opt.name === "Size")?.value
    )
    .filter((size, index, arr) => size && arr.indexOf(size) === index);

  return (
    <div className="max-w-md mx-auto p-4 mt-4">
      <h3 className="mb-2 text-sm font-medium">Select Size</h3>
      <div className="grid grid-cols-5 gap-2">
        {allSizes.map((size) => {
          const isAvailable = availableSizes.includes(size);
          const isSelected = selectedVariant?.size === size;

          return (
            <button
              key={size}
              className={`py-1 px-4 border  text-center transition-colors ${
                !isAvailable
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : isSelected
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:bg-black hover:text-white hover:border-black"
              }`}
              onClick={() => {
                if (!isAvailable) return; // Prevent selection of unavailable variants

                // Find the correct variant for this size
                const variant = product.variants.find(
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
      <p className="mt-2 text-xs text-gray-500">
        Find your size with our size guide.
      </p>
    </div>
  );
}

export default VariantSelector;
