"use client";
import { memo, useMemo } from "react";
import { useProductStore } from "@/store/variantStore";
import type { ShopifyProduct } from "@/types/shopify";

type ShopifyVariant = ShopifyProduct["variants"][number];

interface VariantSelectorProps {
  variants: ShopifyVariant[];
}

/**
 * Client component for size selection.
 * Receives variant data from Shopify (via ProductForm).
 * Updates Zustand store when user selects a size.
 */
const VariantSelector = memo(function VariantSelector({
  variants,
}: VariantSelectorProps) {
  const { selectedVariant, setSelectedVariant } = useProductStore();

  // Check if product has Size option, otherwise treat as "One Size"
  const hasSize = variants.some((v) =>
    v.selectedOptions.some((opt) => opt.name === "Size")
  );

  // Extract unique sizes from variants (or use "One Size" for products without Size option)
  const allSizes = useMemo(() => {
    if (!hasSize) {
      // Product has no Size option - treat as "One Size"
      return ["One Size"];
    }
    return (
      variants
        .filter((variant) =>
          variant.selectedOptions.some((opt) => opt.name === "Size")
        )
        .map(
          (variant) =>
            variant.selectedOptions.find((opt) => opt.name === "Size")?.value
        )
        .filter((size, index, arr) => size && arr.indexOf(size) === index) || []
    );
  }, [variants, hasSize]);

  // Extract available (in-stock) sizes
  const availableSizes = useMemo(() => {
    if (!hasSize) {
      // For "One Size" products, check if any variant is available
      return variants.some((v) => v.availableForSale) ? ["One Size"] : [];
    }
    return (
      variants
        .filter(
          (variant) =>
            variant.availableForSale &&
            variant.selectedOptions.some((opt) => opt.name === "Size")
        )
        .map(
          (variant) =>
            variant.selectedOptions.find((opt) => opt.name === "Size")?.value
        )
        .filter((size, index, arr) => size && arr.indexOf(size) === index) || []
    );
  }, [variants, hasSize]);

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
              aria-label={`Select size ${size}${!isAvailable ? ", unavailable" : ""}${isSelected ? ", selected" : ""}`}
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
                if (!isAvailable) return;

                // Find the variant for this size (prefer available ones)
                let variant;
                if (!hasSize) {
                  // For "One Size" products, just get the first available variant
                  variant = variants.find((v) => v.availableForSale);
                } else {
                  variant = variants.find(
                    (v) =>
                      v.selectedOptions.find((opt) => opt.name === "Size")
                        ?.value === size && v.availableForSale
                  );
                }

                if (variant && size) {
                  setSelectedVariant({
                    size,
                    id: variant.id,
                    available: variant.availableForSale,
                    title: variant.title,
                    price: variant.price.amount,
                    color:
                      variant.selectedOptions.find((opt) => opt.name === "Color")
                        ?.value || "",
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
});

export default VariantSelector;
