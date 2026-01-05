import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useHasMounted } from "@/hooks/useHasMounted";
import Image from "next/image";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils/formatPrice";
import { createCart, addToCart } from "@/lib/shopify/cart";
import CartSkeleton from "@/components/skeletons/CartSkeleton";

/**
 * Renders a slide-in cart modal that displays cart items, allows quantity and removal actions, and initiates a Shopify checkout flow by creating a fresh cart and redirecting to checkout.
 *
 * @param isCartOpen - Controls whether the modal is visible.
 * @param setIsCartOpen - Callback to update the modal's open state.
 * @returns The cart modal React element.
 */
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

  const totalPrice = getTotalPrice();

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      unlockScroll();
    }, 300);
  };

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleNavigate = (path: string) => {
    router.push(path);
    handleClose();
  };

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />
      {/* Modal */}
      <div
        className={
          "fixed top-0 right-0 h-screen w-full bg-white z-50 transform transition-transform duration-300 flex flex-col xl:w-[25vw]" +
          (isCartOpen ? " translate-x-0" : " translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white z-10 h-12 xl:h-16 border-b border-gray-300">
          <div className="text-xs flex justify-between items-center h-full px-2">
            <span>Cart</span>
            <button
              className="text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2">
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
                      {item.brand && (
                        <span
                          className="text-xs font-medium w-full block cursor-pointer"
                          onClick={() => {
                            router.push(`/products/${item.productHandle}`);
                            handleClose();
                          }}
                        >
                          {item.brand}
                        </span>
                      )}
                      <span
                        className="text-xs w-full block cursor-pointer"
                        onClick={() => {
                          router.push(`/products/${item.productHandle}`);
                          handleClose();
                        }}
                      >
                        {item.title}
                      </span>
                      <span className="text-xs block mt-1">
                        Size: {item.size}
                      </span>
                      <span className="text-xs block mt-1">
                        Color: {item.color}
                      </span>
                      <span className="text-xs block mt-1">
                        {formatPrice(item.price?.amount)}{" "}
                        {item.price?.currencyCode}
                      </span>
                      <div className="mt-4 w-full flex items-center">
                        <button
                          className="text-xs mr-4 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleDecreaseQuantity(item.id, item.quantity)
                          }
                        >
                          -
                        </button>
                        <span className="text-xs">{item.quantity}</span>
                        <button
                          className="text-xs ml-4 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleIncreaseQuantity(item.id, item.quantity)
                          }
                        >
                          +
                        </button>
                        <button
                          className="text-xs ml-auto mr-4 cursor-pointer hover:text-gray-600"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="text-xs cursor-pointer hover:text-gray-600 w-full text-center mb-4"
                  onClick={() => {
                    removeAllItems();
                  }}
                >
                  Remove All Items
                </button>
              </div>
            ) : (
              <div className="flex w-full overflow-hidden justify-center items-center h-full flex-col">
                <p className="text-xs">Your cart is currently empty</p>
                <button
                  className="text-xs font-bold mt-4"
                  onClick={() => {
                    router.push("/");
                    handleClose();
                  }}
                >
                  Explore our products
                </button>
              </div>
            )
          ) : (
            <CartSkeleton />
          )}
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0 border-t border-gray-300 bg-white h-60">
          <div className="px-2 py-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-xs">Shipping</p>
                <p className="text-xs">Subtotal (excl. VAT)</p>
                <p className="text-xs text-gray-500">VAT (25%)</p>
                <p className="text-xs font-semibold">Total (incl. VAT)</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <p className="text-xs text-gray-500">Calculated at checkout</p>
                <p className="text-xs">
                  {hasMounted && totalPrice
                    ? `${formatPrice(totalPrice / 1.25)} ${
                        items[0]?.price?.currencyCode || "SEK"
                      }`
                    : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {hasMounted && totalPrice
                    ? `${formatPrice(totalPrice * 0.2)} ${
                        items[0]?.price?.currencyCode || "SEK"
                      }`
                    : ""}
                </p>
                <p className="text-xs font-semibold">
                  {hasMounted && totalPrice
                    ? `${formatPrice(totalPrice)} ${
                        items[0]?.price?.currencyCode || "SEK"
                      }`
                    : ""}
                </p>
              </div>
            </div>

            <button
              className="mt-10 bg-black text-white text-xs py-3 w-full cursor-pointer hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              onClick={async () => {
                if (items.length === 0) return;
                setIsRedirecting(true);

                // Create fresh cart with current items
                const freshCartResult = await createCart();

                if (freshCartResult) {
                  // Add all current items to the fresh cart
                  for (const item of items) {
                    await addToCart(
                      freshCartResult.cartId,
                      item.variantId,
                      item.quantity
                    );
                  }

                  window.location.href = freshCartResult.checkoutUrl;
                }
              }}
              disabled={items.length === 0 || isRedirecting}
            >
              {isRedirecting ? "Redirecting..." : "Go to checkout"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartModal;