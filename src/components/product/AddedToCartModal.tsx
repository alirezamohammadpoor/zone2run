"use client";
import { useUIStore } from "@/lib/cart/uiStore";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/formatPrice";

function AddedToCartModal({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) {
  const {
    showAddedToCartModal,
    lastAddedProduct,
    hideAddedToCart,
    setLastAddedProduct,
  } = useUIStore((state: any) => state);

  const [isVisible, setIsVisible] = useState(false);

  // Handle entrance animation
  useEffect(() => {
    if (showAddedToCartModal) {
      // Start animation after a brief delay to ensure component is mounted
      setTimeout(() => {
        setIsVisible(true);
      }, 10);

      // Auto-close modal after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        hideAddedToCart();
        // Clear product data after animation completes
        setTimeout(() => {
          setLastAddedProduct(null);
        }, 300); // Match animation duration
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showAddedToCartModal, hideAddedToCart, setLastAddedProduct]);

  // Only guard product data, not visibility (like CartModal)
  if (!lastAddedProduct) return null;

  return (
    <div
      className={`fixed top-16 right-0 h-[15vh] z-50 flex justify-center transform transition-transform duration-500 ease-in-out w-full xl:w-[25vw] overflow-hidden ${
        isVisible ? " translate-x-0" : " translate-x-full"
      } `}
    >
      <div className="bg-white w-full flex flex-col h-full overflow-hidden">
        {/* Product Info */}
        <div className="flex items-center gap-4 flex-1 min-h-0 p-2">
          {lastAddedProduct.image && (
            <Image
              src={lastAddedProduct.image}
              alt={lastAddedProduct.title}
              width={80}
              height={80}
              className="object-cover flex-shrink-0"
            />
          )}
          <div className="text-left">
            <h3 className="text-xs font-semibold">{lastAddedProduct.brand}</h3>
            <p className="text-xs">{lastAddedProduct.title}</p>
            <p className="text-xs">Size: {lastAddedProduct.size}</p>
            <p className="text-xs">
              Price: {formatPrice(lastAddedProduct.price)}{" "}
              {lastAddedProduct.currencyCode}
            </p>
          </div>
        </div>
        {/* View Cart Button - Always at bottom */}
        <div className="flex justify-end px-4">
          <button
            onClick={() => {
              setIsCartOpen(true);
              hideAddedToCart();
            }}
            className="px-4 py-1 bg-black text-white text-xs cursor-pointer hover:bg-gray-800"
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddedToCartModal;
