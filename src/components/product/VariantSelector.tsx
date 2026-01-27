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

  // Single-pass preprocessing: extract sizes, availability, and variant lookup map
  // O(n) instead of O(4n) with multiple traversals + O(n²) indexOf dedup
  const { hasSize, allSizes, availableSizes, variantBySize, oneSizeVariant } =
    useMemo(() => {
      const sizeSet = new Set<string>();
      const availableSet = new Set<string>();
      const variantMap = new Map<string, ShopifyVariant>();
      let foundSize = false;
      let firstAvailable: ShopifyVariant | null = null;

      for (const v of variants) {
        const sizeOpt = v.selectedOptions.find((o) => o.name === "Size");
        if (sizeOpt?.value) {
          foundSize = true;
          sizeSet.add(sizeOpt.value);
          if (v.availableForSale) {
            availableSet.add(sizeOpt.value);
            // Store first available variant per size for click handler
            if (!variantMap.has(sizeOpt.value)) {
              variantMap.set(sizeOpt.value, v);
            }
          }
        }
        // Track first available for "One Size" products
        if (v.availableForSale && !firstAvailable) {
          firstAvailable = v;
        }
      }

      return {
        hasSize: foundSize,
        allSizes: foundSize ? Array.from(sizeSet) : ["One Size"],
        availableSizes: foundSize
          ? availableSet
          : firstAvailable
            ? new Set(["One Size"])
            : new Set<string>(),
        variantBySize: variantMap,
        oneSizeVariant: firstAvailable,
      };
    }, [variants]);

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
          // O(1) Set lookup instead of array.includes O(n)
          const isAvailable = availableSizes.has(size);
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

                // O(1) Map lookup instead of array.find O(n)
                const variant = hasSize
                  ? variantBySize.get(size)
                  : oneSizeVariant;

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
