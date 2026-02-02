import { orderConfirmationMetadata } from "@/lib/metadata";

export const metadata = orderConfirmationMetadata;

export default function OrderConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
