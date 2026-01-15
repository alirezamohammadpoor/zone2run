"use client";

import { useState } from "react";

interface ProductTabsProps {
  productDetails?: string;
  shippingAndReturns?: string;
  payments?: string;
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `collapsible-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="border-b py-3">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full text-left flex justify-between items-center"
      >
        <span className="font-medium text-xs">{title}</span>
        <span className="text-xl" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div id={contentId} className="mt-2 text-xs text-gray-700 whitespace-pre-line">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductTabs({
  productDetails = "Your product details content here",
  shippingAndReturns = "Your shipping and returns content here",
  payments = "Your secure payments content here",
}: ProductTabsProps) {
  return (
    <div className="my-8 md:my-12 xl:my-16">
      <Collapsible title="Product Details">
        {productDetails}
      </Collapsible>

      <Collapsible title="Shipping and Returns">
        {shippingAndReturns}
      </Collapsible>

      <Collapsible title="Payments">
        {payments}
      </Collapsible>
    </div>
  );
}
