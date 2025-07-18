import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useHasMounted } from "@/hooks/useHasMounted";
import Image from "next/image";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils/formatPrice";

function CartModal({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const {
    items,
    removeItem,
    getTotalPrice,
    updateQuantity,
    shopifyCheckoutUrl,
    syncWithShopify,
    removeAllItems,
  } = useCartStore();
  const { unlockScroll } = useModalScrollRestoration();
  const hasMounted = useHasMounted();

  // Calculate total price from all cart items
  const totalPrice = getTotalPrice();

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

  // Quantity control handlers
  const handleIncreaseQuantity = async (
    itemId: string,
    currentQuantity: number
  ) => {
    await updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = async (
    itemId: string,
    currentQuantity: number
  ) => {
    if (currentQuantity > 1) {
      await updateQuantity(itemId, currentQuantity - 1);
    }
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
          <div className="text-sm flex justify-between items-center h-8 relative mt-4 px-4">
            <span>Cart</span>
            <button
              className="mr-2 text-sm hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-2 "></div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4">
          {hasMounted ? (
            items.length > 0 ? (
              <div className="py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex w-full overflow-hidden mb-8"
                  >
                    <Image
                      src={item.image || ""}
                      alt={item.title}
                      width={80}
                      height={120}
                      className="h-[120px] w-[80px] flex-shrink-0 object-cover cursor-pointer"
                      onClick={() => {
                        router.push(`/products/${item.productHandle}`);
                        handleClose();
                      }}
                    />
                    <div className="ml-4 flex flex-1 flex-col overflow-hidden">
                      <span
                        className="text-sm font-bold w-full block cursor-pointer"
                        onClick={() => {
                          router.push(`/products/${item.productHandle}`);
                          handleClose();
                        }}
                      >
                        {item.title}
                      </span>
                      <span className="text-sm block mt-1">
                        Size: {item.size}
                      </span>
                      <span className="text-sm block mt-1">
                        Color: {item.color}
                      </span>
                      <span className="text-sm block mt-1">
                        {formatPrice(item.price?.amount)}{" "}
                        {item.price?.currencyCode}
                      </span>
                      <div className="mt-4 w-full flex items-center">
                        <button
                          className="text-sm mr-4 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleDecreaseQuantity(item.id, item.quantity)
                          }
                        >
                          -
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          className="text-sm ml-4 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleIncreaseQuantity(item.id, item.quantity)
                          }
                        >
                          +
                        </button>
                        <button
                          className="text-sm ml-auto mr-4 cursor-pointer underline font-bold"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="text-sm cursor-pointer underline font-bold w-full text-center mb-4"
                  onClick={() => removeAllItems()}
                >
                  Remove All Items
                </button>
              </div>
            ) : (
              <div className="flex w-full overflow-hidden justify-center items-center h-full flex-col">
                <p className="text-md">Your cart is currently empty</p>
                <button
                  className="text-md font-bold mt-4"
                  onClick={() => {
                    router.push("/products");
                    handleClose();
                  }}
                >
                  Explore our products
                </button>
              </div>
            )
          ) : (
            <div className="flex w-full overflow-hidden mt-8">
              <span className="text-sm">Loading cart...</span>
            </div>
          )}
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0 border-t border-gray-300">
          {/* Price Container */}
          <div className="px-2 w-full flex items-center py-4">
            <div className="flex flex-col gap-2.5">
              <p className="text-sm">Subtotal (excl. VAT)</p>
              <p className="text-sm">Shipping</p>
              <p className="text-sm font-semibold">Total (incl. VAT)</p>
              <p className="text-sm text-gray-500">VAT (25%) included</p>
            </div>
            <div className="flex-1"></div>
            <div className="px-2 flex flex-col gap-2.5 items-end">
              <p className="text-sm">
                {hasMounted && totalPrice
                  ? `${formatPrice(totalPrice / 1.25)} ${
                      items[0]?.price?.currencyCode || "SEK"
                    }`
                  : "Loading..."}
              </p>
              <p className="text-sm text-gray-500">Calculated at checkout</p>
              <p className="text-sm font-semibold">
                {hasMounted && totalPrice
                  ? `${formatPrice(totalPrice)} ${
                      items[0]?.price?.currencyCode || "SEK"
                    }`
                  : "Loading..."}
              </p>
              <p className="text-sm text-gray-500">
                {hasMounted && totalPrice
                  ? `${formatPrice(totalPrice * 0.2)} ${
                      items[0]?.price?.currencyCode || "SEK"
                    }`
                  : "Loading..."}
              </p>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="p-2.5 w-full">
            <button
              className="border border-black bg-black text-white text-base py-2.5 px-5 w-full mb-5 cursor-pointer hover:bg-gray-800"
              onClick={async () => {
                if (items.length === 0) return;

                // Sync with Shopify if needed
                await syncWithShopify();

                // Redirect to Shopify checkout
                if (shopifyCheckoutUrl) {
                  window.location.href = shopifyCheckoutUrl;
                } else {
                  console.error("No checkout URL available");
                }
              }}
              disabled={items.length === 0}
            >
              Go to checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartModal;
