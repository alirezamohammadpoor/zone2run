"use client";

import { useState } from "react";
import ProductDescription from "@/components/ProductDescription";

const TABS = [
  "Product Description",
  "Product Details",
  "Shipping and Returns",
  "Payments",
] as const;

type TabType = (typeof TABS)[number];

interface ProductTabsProps {
  description: string;
  productDetails?: string;
  shippingAndReturns?: string;
  payments?: string;
}

export default function ProductTabs({
  description,
  productDetails = "Your product details content here",
  shippingAndReturns = "Your shipping and returns content here",
  payments = "Your secure payments content here",
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Product Description");

  return (
    <div className="mt-12 mb-12">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`flex-1 text-xs py-2 ${
              activeTab === tab
                ? "border-b-[1.5px] border-black font-medium"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "Product Description" && (
          <ProductDescription description={description} />
        )}

        {activeTab === "Product Details" && (
          <div className="ml-2 mt-4 text-sm text-gray-700 whitespace-pre-line">
            {productDetails}
          </div>
        )}

        {activeTab === "Shipping and Returns" && (
          <div className="ml-2 mt-4 text-sm text-gray-700 whitespace-pre-line">
            {shippingAndReturns}
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="ml-2 mt-4 text-sm text-gray-700 whitespace-pre-line">
            {payments}
          </div>
        )}
      </div>
    </div>
  );
}

