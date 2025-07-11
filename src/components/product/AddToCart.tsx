"use client";
import React from "react";
import { useCartStore } from "@/lib/cart/store";
import { Variant } from "@/store/variantStore";

interface AddToCartProps {
  product: {
    title: string;
    handle: string;
    productImage: string;
  };
  selectedVariant: Variant | null;
}

function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const handleClick = async () => {
    if (!selectedVariant) return;

    await addItem({
      id: `${product.handle}-${selectedVariant.size}`,
      variantId: selectedVariant.id,
      productHandle: product.handle,
      title: product.title,
      price: {
        amount: selectedVariant.price ?? 0,
        currencyCode: "SEK",
      },
      image: product.productImage || "",
      color: selectedVariant.color ?? "",
      size: selectedVariant.size,
    });
  };

  return (
    <div className="flex justify-center items-center">
      <button
        className={`
          w-[95%] h-[50px] mt-12
          ${
            !selectedVariant
              ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
              : !selectedVariant.available
              ? "bg-red-500 text-white cursor-not-allowed border border-red-500"
              : "bg-black text-white cursor-pointer"
          }
        `}
        onClick={handleClick}
        disabled={!selectedVariant || !selectedVariant.available}
      >
        {!selectedVariant
          ? "SELECT SIZE"
          : !selectedVariant.available
          ? "OUT OF STOCK"
          : "ADD TO CART"}
      </button>
    </div>
  );
}

export default AddToCart;
