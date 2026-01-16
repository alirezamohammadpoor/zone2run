"use client";
import { useUIStore } from "@/lib/cart/uiStore";
import React, { memo, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/formatPrice";

const AddedToCartModal = memo(function AddedToCartModal({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) {
  // Use individual selectors to prevent re-renders from unrelated state changes
  const showAddedToCartModal = useUIStore((state) => state.showAddedToCartModal);
  const lastAddedProduct = useUIStore((state) => state.lastAddedProduct);
  const hideAddedToCart = useUIStore((state) => state.hideAddedToCart);
  const setLastAddedProduct = useUIStore((state) => state.setLastAddedProduct);

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
      className={`fixed top-12 xl:top-16 right-0 h-[13vh] z-50 flex justify-center transform transition-transform duration-500 ease-in-out w-full xl:w-[27vw] overflow-hidden ${
        isVisible ? " translate-x-0" : " translate-x-full"
      } `}
    >
      <div className="bg-white w-full flex h-full overflow-hidden">
        {/* Product Image */}
        {lastAddedProduct.image && (
          <div className="relative h-full aspect-[4/5] flex-shrink-0">
            <Image
              src={lastAddedProduct.image}
              alt={lastAddedProduct.title}
              fill
              className="object-contain"
            />
          </div>
        )}
        {/* Product Info + Button */}
        <div className="flex flex-col flex-1">
          <div className="text-left flex flex-col justify-center h-full px-2 mt-4">
            <p className="text-xs font-semibold">{lastAddedProduct.brand}</p>
            <p className="text-xs">{lastAddedProduct.title}</p>
            <p className="text-xs">
              {formatPrice(lastAddedProduct.price)}{" "}
              {lastAddedProduct.currencyCode}
            </p>
            <p className="text-xs">Size: {lastAddedProduct.size}</p>
            <div className="flex justify-end mt-auto">
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  hideAddedToCart();
                }}
                className="px-4 py-1 bg-black text-white text-xs cursor-pointer"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AddedToCartModal;
