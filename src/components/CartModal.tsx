import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SearchProductGrid from "./SearchProductGrid";
import { getAllProducts } from "@/sanity/lib/getData";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";

function CartModal({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();

  const { unlockScroll } = useModalScrollRestoration();

  const handleClose = () => {
    setIsCartOpen(false);
    // Delay scroll restoration to allow modal animation to complete
    setTimeout(() => {
      unlockScroll();
    }, 300);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    handleClose();
  };

  // Prevent body scroll when modal is open
  useModalScroll(isCartOpen);

  return (
    <>
      {/* Modal */}
      <div
        className={
          "fixed top-0 right-0 h-screen w-full bg-white z-50 transform transition-transform duration-300 overflow-hidden flex flex-col" +
          (isCartOpen ? " translate-x-0" : " translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="bg-white z-10 h-16 flex-shrink-0">
          {/* Modal Header */}
          <div className="text-xs flex justify-between items-center h-8 relative mt-4 px-4">
            <span>Cart</span>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-2 "></div>
        </div>

        <div className="flex w-full overflow-hidden mt-8">
          <div className="h-[120px] w-[80px] bg-black ml-4 flex-shrink-0  "></div>
          <div className="ml-4 flex flex-1 flex-col overflow-hidden">
            <span className="text-sm font-bold w-full block">Product Name</span>
            <span className="text-sm block mt-1">Size: XS</span>
            <span className="text-sm block mt-1">Color: Black</span>
            <span className="text-sm block mt-1">Price: 1500 SEK</span>
            <div className="mt-4 w-full flex items-center">
              <span className="text-sm mr-4 cursor-pointer">-</span>
              <span className="text-sm">1</span>
              <span className="text-sm ml-4 cursor-pointer">+</span>

              <span className="text-sm ml-auto mr-4 cursor-pointer underline font-bold">
                Remove
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto mb-10 border-b border-gray-300 w-full"></div>
        {/* Price Container */}
        <div className="px-2 w-full flex items-center">
          <div className="flex flex-col gap-2.5">
            <p className="text-sm">Subtotal</p>
            <p className="text-sm">Shipping</p>
            <p className="text-sm">Total</p>
            <p className="text-sm">Including 25% VAT</p>
          </div>
          <div className=" flex-1"></div>
          <div className="px-2 flex flex-col gap-2.5 items-end">
            <p className="text-sm">1500 SEK</p>
            <p className="text-sm text-gray-500">Calculated at checkout</p>
            <p className="text-sm">1500 SEK</p>
            <p className="text-sm">375 SEK</p>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="p-2.5 w-full ">
          <button
            className="border border-black bg-black text-white text-base py-2.5 px-5 w-full mb-5 cursor-pointer mt-5 hover:bg-gray-800"
            onClick={() => router.push("/checkout")}
          >
            Go to checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default CartModal;
