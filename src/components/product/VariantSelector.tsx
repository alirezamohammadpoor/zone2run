"use client";
import React, { memo, useMemo, useCallback } from "react";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";

interface VariantSelectorProps {
  product: SanityProduct;
}

const VariantSelector = memo(function VariantSelector({ product }: VariantSelectorProps) {
  const selectedVariant = useProductStore((state) => state.selectedVariant);
  const setSelectedVariant = useProductStore((state) => state.setSelectedVariant);

  // O(n) deduplication using Set instead of O(n²) indexOf
  const allSizes = useMemo(() => {
    const seen = new Set<string>();
    return (
      product.variants
        ?.filter((v) => v.selectedOptions.some((opt) => opt.name === "Size"))
        .map((v) => v.selectedOptions.find((opt) => opt.name === "Size")?.value)
        .filter((size): size is string => {
          if (!size || seen.has(size)) return false;
          seen.add(size);
          return true;
        }) || []
    );
  }, [product.variants]);

  // O(n) deduplication for available sizes
  const availableSizes = useMemo(() => {
    const seen = new Set<string>();
    return (
      product.variants
        ?.filter(
          (v) =>
            v.available && v.selectedOptions.some((opt) => opt.name === "Size")
        )
        .map((v) => v.selectedOptions.find((opt) => opt.name === "Size")?.value)
        .filter((size): size is string => {
          if (!size || seen.has(size)) return false;
          seen.add(size);
          return true;
        }) || []
    );
  }, [product.variants]);

  // Memoized click handler to avoid recreating function on every render
  const handleSizeSelect = useCallback(
    (size: string | undefined) => {
      if (!size) return;
      const variant = product.variants?.find(
        (v) =>
          v.selectedOptions.find((opt) => opt.name === "Size")?.value ===
            size && v.available
      );
      if (variant) {
        setSelectedVariant({
          size,
          id: variant.id,
          available: variant.available,
          title: variant.title,
          price: variant.price,
          color:
            variant.selectedOptions.find((opt) => opt.name === "Color")
              ?.value || "",
        });
      }
    },
    [product.variants, setSelectedVariant]
  );

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
              onClick={() => handleSizeSelect(size)}
              disabled={!isAvailable}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default VariantSelector;
