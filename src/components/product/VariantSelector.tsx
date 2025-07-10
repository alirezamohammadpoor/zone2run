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
  const availableSizes = helper.getAvailableSizes();

  return (
    <div className="max-w-md mx-auto p-4 mt-4">
      <h3 className="mb-2 text-sm font-medium">Select Size</h3>
      <div className="grid grid-cols-3 gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            className={`py-2 px-4 border rounded text-center ${
              selectedVariant?.size === size
                ? "bg-black text-white"
                : "hover:bg-black hover:text-white"
            }`}
            onClick={() => {
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
          >
            {size}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Find your size with our size guide.
      </p>
    </div>
  );
}

export default VariantSelector;
