import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

function CartModal({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const { items, removeItem } = useCartStore();
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

        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex w-full overflow-hidden mt-8">
              <Image
                src={item.image}
                alt={item.title}
                width={80}
                height={120}
                className="h-[120px] w-[80px] flex-shrink-0"
              />
              <div className="ml-4 flex flex-1 flex-col overflow-hidden">
                <span className="text-sm font-bold w-full block">
                  {item.title}
                </span>
                <span className="text-sm block mt-1">
                  Size: {item.variantId}
                </span>
                <span className="text-sm block mt-1">Color: {item.color}</span>
                <span className="text-sm block mt-1">
                  Price: {item.price} SEK
                </span>
                <div className="mt-4 w-full flex items-center">
                  <span className="text-sm mr-4 cursor-pointer">-</span>
                  <span className="text-sm">{item.quantity}</span>
                  <span className="text-sm ml-4 cursor-pointer">+</span>
                  <button
                    className="text-sm ml-auto mr-4 cursor-pointer underline font-bold"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex w-full overflow-hidden mt-8">
            <span className="text-sm">Cart is empty</span>
          </div>
        )}

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
