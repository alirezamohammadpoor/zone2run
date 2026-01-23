import { useState } from "react";
import Link from "next/link";
import FocusLock from "react-focus-lock";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useHasMounted } from "@/hooks/useHasMounted";
import Image from "next/image";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils/formatPrice";
import { createCart } from "@/lib/shopify/cart";
import { checkCartAvailability } from "@/app/actions/cart";

function CartModal({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) {
  const {
    items,
    removeItem,
    getTotalPrice,
    updateQuantity,
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
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [oosItems, setOosItems] = useState<string[]>([]);

  // Non-blocking quantity updates - UI updates immediately, API syncs in background
  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
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
        role="presentation"
        aria-hidden="true"
      />
      {/* Modal */}
      <FocusLock disabled={!isCartOpen}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
          inert={!isCartOpen ? true : undefined}
          className={
            "fixed inset-0 bg-white z-50 transform transition-transform duration-300 flex flex-col xl:left-auto xl:right-0 xl:w-[25vw] overscroll-contain" +
            (isCartOpen ? " translate-x-0" : " translate-x-full")
          }
        >
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-white z-10 h-12 xl:h-16 border-b border-gray-300">
            <div className="text-xs flex justify-between items-center h-full px-2">
              <span id="cart-title">Cart</span>
              <button
                className="text-xs hover:text-gray-500"
                onClick={handleClose}
                aria-label="Close cart"
              >
                Close
              </button>
            </div>
          </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 overscroll-contain">
          {hasMounted ? (
            items.length > 0 ? (
              <div className="py-4">
                {items.map((item) => {
                  const isOos = oosItems.includes(item.id);
                  return (
                  <div
                    key={item.id}
                    className={`flex w-full overflow-hidden mb-8 ${isOos ? "opacity-50" : ""}`}
                  >
                    <Link
                      href={`/products/${item.productHandle}`}
                      onClick={handleClose}
                      className="flex-shrink-0"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={120}
                          className="h-[120px] w-[80px] object-cover"
                        />
                      )}
                    </Link>
                    <div className="ml-4 flex flex-1 flex-col overflow-hidden">
                      <Link
                        href={`/products/${item.productHandle}`}
                        onClick={handleClose}
                        className="hover:underline"
                      >
                        {item.brand && (
                          <span className="text-xs font-medium w-full block">
                            {item.brand}
                          </span>
                        )}
                        <span className="text-xs w-full block">
                          {item.title}
                        </span>
                      </Link>
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
                      {isOos && (
                        <span className="text-xs text-red-500 block mt-1">
                          Out of Stock
                        </span>
                      )}
                      <div className="mt-4 w-full flex items-center">
                        <button
                          className="text-xs mr-4 cursor-pointer hover:text-gray-600 min-h-[44px] min-w-[44px]"
                          onClick={() =>
                            handleDecreaseQuantity(item.id, item.quantity)
                          }
                          aria-label={`Decrease quantity for ${item.title}`}
                        >
                          −
                        </button>
                        <span className="text-xs">{item.quantity}</span>
                        <button
                          className="text-xs ml-4 cursor-pointer hover:text-gray-600 min-h-[44px] min-w-[44px]"
                          onClick={() =>
                            handleIncreaseQuantity(item.id, item.quantity)
                          }
                          aria-label={`Increase quantity for ${item.title}`}
                        >
                          +
                        </button>
                        <button
                          className="text-xs ml-auto mr-4 cursor-pointer hover:text-gray-600 min-h-[44px] min-w-[44px]"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
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
                <Link
                  href="/"
                  className="text-xs font-bold mt-4"
                  onClick={handleClose}
                >
                  Explore our products
                </Link>
              </div>
            )
          ) : null}
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0 border-t border-gray-300 bg-white h-48">
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

            {oosItems.length > 0 && (
              <p className="text-xs text-red-500 mb-2">
                Some items are no longer available. Remove them to continue.
              </p>
            )}

            <button
              className="mt-4 bg-black text-white text-xs py-3 w-full cursor-pointer hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              onClick={async () => {
                if (items.length === 0) return;

                setIsCheckingAvailability(true);
                setOosItems([]);

                try {
                  // Check availability - single Shopify request
                  const variantIds = items.map((i) => i.variantId);
                  const availability = await checkCartAvailability(variantIds);

                  // Find unavailable items (by cart item id)
                  const unavailable = items
                    .filter((item) => availability[item.variantId] === false)
                    .map((item) => item.id);

                  if (unavailable.length > 0) {
                    setOosItems(unavailable);
                    setIsCheckingAvailability(false);
                    return;
                  }

                  // All available - proceed to checkout
                  setIsCheckingAvailability(false);
                  setIsRedirecting(true);

                  // Create cart with ALL items in single API call
                  const cartResult = await createCart(
                    items.map((i) => ({
                      variantId: i.variantId,
                      quantity: i.quantity,
                    }))
                  );

                  if (cartResult) {
                    // Update store with new cart ID (for abandoned cart tracking)
                    useCartStore
                      .getState()
                      .setShopifyCart(cartResult.cartId, cartResult.checkoutUrl);

                    window.location.href = cartResult.checkoutUrl;
                  }
                } catch (error) {
                  console.error("Checkout failed:", error);
                  setIsCheckingAvailability(false);
                  setIsRedirecting(false);
                }
              }}
              disabled={items.length === 0 || isCheckingAvailability || isRedirecting}
            >
              {isCheckingAvailability
                ? "Processing..."
                : isRedirecting
                  ? "Redirecting..."
                  : "Go to checkout"}
            </button>
          </div>
        </div>
        </div>
      </FocusLock>
    </>
  );
}

export default CartModal;
