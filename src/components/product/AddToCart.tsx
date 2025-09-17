"use client";
import React, { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useUIStore } from "@/lib/cart/uiStore";
import { Variant } from "@/store/variantStore";

interface AddToCartProps {
  product: {
    title: string;
    handle: string;
    productImage: string;
    brand: string;
    currencyCode: string;
  };
  selectedVariant: Variant | null;
}

function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const showAddedToCart = useUIStore((state: any) => state.showAddedToCart);

  const handleClick = async () => {
    if (!selectedVariant || isAdded) return;

    addItem({
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
      brand: product.brand,
    });

    setIsAdded(true);
    showAddedToCart({
      brand: product.brand,
      title: product.title,
      image: product.productImage,
      size: selectedVariant.size,
      color: selectedVariant.color ?? "",
      price: selectedVariant.price ?? 0,
      currencyCode: product.currencyCode,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  };

  return (
    <div className="flex justify-center items-center">
      <button
        className={`
          w-[95%] h-[50px] mt-12 transition-colors duration-300 ease-in-out
          ${
            !selectedVariant
              ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
              : !selectedVariant.available
              ? "bg-red-500 text-white cursor-not-allowed border border-red-500"
              : isAdded
              ? "bg-green-500 text-white cursor-pointer"
              : "bg-black text-white cursor-pointer"
          }
        `}
        onClick={handleClick}
        disabled={!selectedVariant || !selectedVariant.available || isAdded}
      >
        {!selectedVariant
          ? "SELECT SIZE"
          : !selectedVariant.available
          ? "OUT OF STOCK"
          : isAdded
          ? "ADDED TO CART"
          : "ADD TO CART"}
      </button>
    </div>
  );
}

export default AddToCart;
