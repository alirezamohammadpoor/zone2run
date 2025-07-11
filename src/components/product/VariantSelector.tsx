"use client";
import React, { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useProductStore } from "@/store/variantStore";
import { ProductHelper } from "@/types/product";
import type { Product } from "@/types/product";

interface VariantSelectorProps {
  product: Product;
}

function VariantSelector({ product }: VariantSelectorProps) {
  const { selectedVariant, setSelectedVariant } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);

  const helper = new ProductHelper(product);

  // Get all unique sizes (both available and unavailable)
  const allSizes = product.shopify.variants
    .filter((variant) => variant.size)
    .map((variant) => variant.size!)
    .filter((size, index, arr) => arr.indexOf(size) === index); // unique

  // Get available sizes for comparison
  const availableSizes = helper.getAvailableSizes();

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

                // Find the correct Shopify variant for this size
                const shopifyVariant = product.shopify.variants.find(
                  (variant) => variant.size === size && variant.availableForSale
                );

                if (shopifyVariant) {
                  setSelectedVariant({
                    size,
                    id: shopifyVariant.id, // Use the actual Shopify variant ID
                    available: shopifyVariant.availableForSale,
                    title: shopifyVariant.title,
                    price: shopifyVariant.price.amount,
                    color: shopifyVariant.color,
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
