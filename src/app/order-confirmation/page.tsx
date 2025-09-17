"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useHasMounted } from "@/hooks/useHasMounted";
import Image from "next/image";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils/formatPrice";

import Header from "@/components/Header";

export default function OrderConfirmation() {
  const router = useRouter();
  const { items, getTotalPrice } = useCartStore();
  const hasMounted = useHasMounted();

  const totalPrice = getTotalPrice();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="h-[90vh]">
      <Header />
      <div className="flex flex-col justify-center mt-8 ml-4 w-1/2">
        <p className="text-sm mb-2">
          Thank you for your purchase! Your order has been confirmed.
        </p>
        <p className="text-sm mb-2">
          See your order summary below. Your receipt will be sent out via
          e-mail.
        </p>
        <p className="text-sm mb-2">Order number: 1234567890</p>
      </div>

      {/* Scrollable Content Area - responsive flexbox */}
      <div className="flex-1 max-h-[40vh] overflow-y-auto px-4 mt-4">
        {items.length > 0 ? (
          <div className="py-4">
            {items.map((item) => (
              <div key={item.id} className="flex w-full overflow-hidden mb-8">
                <Image
                  src={item.image || ""}
                  alt={item.title}
                  width={80}
                  height={120}
                  className="h-[120px] w-[80px] flex-shrink-0 object-cover cursor-pointer"
                  onClick={() =>
                    handleNavigate(`/products/item/${item.productHandle}`)
                  }
                />
                <div className="ml-4 flex flex-1 flex-col overflow-hidden">
                  <span
                    className="text-sm font-bold w-full block cursor-pointer"
                    onClick={() =>
                      handleNavigate(`/products/item/${item.productHandle}`)
                    }
                  >
                    {item.title}
                  </span>
                  <span className="text-sm block mt-1">Size: {item.size}</span>
                  <span className="text-sm block mt-1">
                    Color: {item.color}
                  </span>
                  <span className="text-sm block mt-1">
                    {formatPrice(item.price?.amount)} {item.price?.currencyCode}
                  </span>
                  <div className="mt-4 w-full flex items-center">
                    <span className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 border-t border-gray-300 bg-white h-40 mt-12">
        <div className="px-4 py-4 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2.5">
              <p className="text-sm">Shipping</p>
              <p className="text-sm">Subtotal (excl. VAT)</p>
              <p className="text-sm text-gray-500">VAT (25%)</p>
              <p className="text-sm font-semibold">Total (incl. VAT)</p>
            </div>
            <div className="flex flex-col gap-2.5 items-end">
              <p className="text-sm text-gray-500">Calculated at checkout</p>
              <p className="text-sm">
                {hasMounted && totalPrice
                  ? `${formatPrice(totalPrice / 1.25)} ${
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
              <p className="text-sm font-semibold">
                {hasMounted && totalPrice
                  ? `${formatPrice(totalPrice)} ${
                      items[0]?.price?.currencyCode || "SEK"
                    }`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Billing and Shipping Section */}
      <div className="flex-shrink-0 border-t border-gray-300 bg-white h-40 w-full">
        <div className="px-4 py-4 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-semibold">Billing Address</p>
              <p className="text-sm text-gray-600">John Doe</p>
              <p className="text-sm text-gray-600">123 Main Street</p>
              <p className="text-sm text-gray-600">Stockholm, 12345</p>
              <p className="text-sm text-gray-600">Sweden</p>
              <p className="text-sm text-gray-600">+46 70 123 45 67</p>
              <p className="text-sm text-gray-600">john.doe@email.com</p>
            </div>
            <div className="flex flex-col gap-2.5 items-end">
              <p className="text-sm font-semibold">Shipping Address</p>
              <p className="text-sm text-gray-600">John Doe</p>
              <p className="text-sm text-gray-600">123 Main Street</p>
              <p className="text-sm text-gray-600">Stockholm, 12345</p>
              <p className="text-sm text-gray-600">Sweden</p>
              <p className="text-sm text-gray-600">+46 70 123 45 67</p>
              <p className="text-sm text-gray-600">john.doe@email.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
