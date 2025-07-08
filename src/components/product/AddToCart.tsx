"use client";
import React from "react";
import { useCartStore } from "@/store/cartStore";
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
  const handleClick = () => {
    if (!selectedVariant) return;

    addItem({
      id: `${product.handle}-${selectedVariant.size}`,
      variantId: selectedVariant.id,
      productHandle: product.handle,
      title: product.title,
      price: selectedVariant.price ?? 0,
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
