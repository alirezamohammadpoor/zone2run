"use client";
import React, { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";

interface VariantSelectorListProps {
  product: SanityProduct;
  openVariantSelector: boolean;
  setOpenVariantSelector: (openVariantSelector: boolean) => void;
}

function VariantSelectorList({
  product,
  openVariantSelector,
  setOpenVariantSelector,
}: VariantSelectorListProps) {
  const { selectedVariant, setSelectedVariant } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);
  const toggleVariantSelector = () => {
    setOpenVariantSelector(!openVariantSelector);
  };

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
    <div
      className={`w-[50vw] bg-white text-black fixed right-0 bottom-0 mb-16 px-2${
        openVariantSelector ? " translate-y-0" : " -translate-y-100"
      } transition-transform duration-300 ease-in-out`}
    >
      {openVariantSelector && (
        <div className="flex flex-col text-black h-full ">
          {allSizes.map((size) => {
            const isAvailable = availableSizes.includes(size);
            const isSelected = selectedVariant?.size === size;
            const isOneSize =
              size?.toLowerCase() === "one size" ||
              size?.toLowerCase() === "onesize";

            return (
              <button
                key={size}
                className={`py-1 px-4 border text-center transition-colors ${
                  isOneSize ? "w-full text-lg" : ""
                } ${
                  !isAvailable
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : isSelected
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:bg-black hover:text-white hover:border-black"
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
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
      )}
    </div>
  );
}

export default VariantSelectorList;
