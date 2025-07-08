"use client";
import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/variantStore";

function VariantSelector() {
  const { selectedVariant, setSelectedVariant } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="max-w-md mx-auto p-4 mt-4">
      <h3 className="mb-2 text-sm font-medium">Select Size</h3>
      <div className="grid grid-cols-3 gap-2">
        {["XS", "S", "M", "L", "XL"].map((size) => (
          <button
            key={size}
            className={`py-2 px-4 border rounded text-center ${
              selectedVariant?.size === size
                ? "bg-black text-white"
                : "hover:bg-black hover:text-white"
            }`}
            onClick={() =>
              setSelectedVariant({
                size,
                id: size,
                available: true,
                title: size,
                price: 0,
              })
            }
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
