"use client";
import React, { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useUIStore } from "@/lib/cart/uiStore";
import { Variant } from "@/store/variantStore";
import VariantSelectorList from "@/components/product/VariantSelectorList";
import type { SanityProduct } from "@/types/sanityProduct";

interface AddToCartProps {
  product: SanityProduct;
  selectedVariant: Variant | null;
}

function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const showAddedToCart = useUIStore((state) => state.showAddedToCart);
  const [openVariantSelector, setOpenVariantSelector] = useState(false);
  const handleClick = async () => {
    if (!selectedVariant || isAdded) return;

    const handleClose = async () => {
      setOpenVariantSelector(false);
    };

    handleClose();

    addItem({
      id: `${product.handle}-${selectedVariant.size}`,
      variantId: selectedVariant.id,
      productHandle: product.handle,
      title: product.title,
      price: {
        amount: selectedVariant.price ?? 0,
        currencyCode: "SEK",
      },
      image: product.mainImage?.url || "",
      color: selectedVariant.color ?? "",
      size: selectedVariant.size,
      brand: product.brand?.name || product.vendor,
    });

    setIsAdded(true);
    showAddedToCart({
      brand: product.brand?.name || product.vendor,
      title: product.title,
      image: product.mainImage?.url || "",
      size: selectedVariant.size,
      color: selectedVariant.color ?? "",
      price: selectedVariant.price ?? 0,
      currencyCode: "SEK",
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  };

  return (
    <div className="mt-4">
      <button
        className={`
            w-full h-[50px] text-xs transition-colors duration-300 ease-in-out
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

//   return (
//     <div className="flex items-center justify-between gap-2 px-2 fixed bottom-2 left-0 right-0 z-50">
//       <button
//         className={`
//         w-[50%] h-[50px] transition-colors duration-300 ease-in-out
//         ${
//           !selectedVariant
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
//             : !selectedVariant.available
//             ? "bg-red-500 text-white cursor-not-allowed border border-red-500"
//             : isAdded
//             ? "bg-green-500 text-white cursor-pointer"
//             : "bg-black text-white cursor-pointer"
//         }
//       `}
//         onClick={handleClick}
//         disabled={!selectedVariant || !selectedVariant.available || isAdded}
//       >
//         {!selectedVariant
//           ? "SELECT SIZE"
//           : !selectedVariant.available
//           ? "OUT OF STOCK"
//           : isAdded
//           ? "ADDED TO CART"
//           : "ADD TO CART"}
//       </button>
//       <button
//         onClick={() => setOpenVariantSelector(!openVariantSelector)}
//         className="w-[50%] h-[50px] text-white bg-black transition-colors duration-300 ease-in-out"
//       >
//         {openVariantSelector ? "Close Sizes" : "Select Size"}
//       </button>
//       <VariantSelectorList
//         product={product}
//         openVariantSelector={openVariantSelector}
//         setOpenVariantSelector={setOpenVariantSelector}
//       />
//     </div>
//   );
// }

export default AddToCart;
