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
      className={`fixed top-10 left-0 h-[15vh] right-0 z-50 flex justify-center transform transition-transform duration-500 ease-in-out ${
        isVisible ? " translate-x-0" : " translate-x-full"
      } `}
    >
      <div className="bg-white w-full">
        {/* Product Info */}
        <div className="flex items-center gap-4">
          {lastAddedProduct.image && (
            <Image
              src={lastAddedProduct.image}
              alt={lastAddedProduct.title}
              width={100}
              height={100}
              className="object-cover"
            />
          )}
          <div className="text-left w-full">
            <h3 className="font-semibold">{lastAddedProduct.brand}</h3>
            <p className="text-sm">{lastAddedProduct.title}</p>
            <p className="text-sm">Size: {lastAddedProduct.size}</p>
            <p className="text-sm">
              Price: {formatPrice(lastAddedProduct.price)}{" "}
              {lastAddedProduct.currencyCode}
            </p>
            <div className="flex justify-end mr-2">
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  hideAddedToCart();
                }}
                className="px-4 bg-black text-white cursor-pointer hover:bg-gray-800"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddedToCartModal;
