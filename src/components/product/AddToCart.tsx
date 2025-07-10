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
    });
  };

  return (
    <div className="flex justify-center items-center">
      <button
        className="bg-black text-white w-[95%] h-[50px] mt-12"
        onClick={handleClick}
        disabled={!selectedVariant}
      >
        ADD TO CART
      </button>
    </div>
  );
}

export default AddToCart;
