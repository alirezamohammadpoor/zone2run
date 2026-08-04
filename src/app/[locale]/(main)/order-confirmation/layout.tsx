import { orderConfirmationMetadata } from "@/lib/metadata";

// Deliberately opted out of instant-navigation validation: this route is a
// placeholder until Shopify order data is wired in (order lookups are
// request-bound by nature, so the subtree will stay allowed to block).
export const instant = false;

export const metadata = orderConfirmationMetadata;

export default function OrderConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
