import ProductCarousel from "./ProductCarousel";
import type { CardProduct } from "@/types/cardProduct";

interface RecentlyViewedSectionProps {
  /** Already-enriched products with locale prices (fetched by parent) */
  products: CardProduct[];
  /** Maximum number of products to display */
  maxProducts?: number;
  /** Handle to exclude (e.g., current product on PDP) */
  excludeHandle?: string;
  /** Callback when modal should close (for SearchModal integration) */
  onProductClick?: () => void;
}

export default function RecentlyViewedSection({
  products,
  maxProducts = 10,
  excludeHandle,
  onProductClick,
}: RecentlyViewedSectionProps) {
  const displayProducts = products
    .filter((p) => p.handle !== excludeHandle)
    .slice(0, maxProducts);

  if (displayProducts.length === 0) return null;

  return (
    <div className="mt-8 flex-col">
      <div className="flex justify-between items-center w-full text-xs mb-4">
        <span>Recently viewed</span>
        <span>
          {displayProducts.length} product
          {displayProducts.length > 1 ? "s" : ""}
        </span>
      </div>
      <ProductCarousel
        products={displayProducts}
        onProductClick={onProductClick}
        className="overflow-hidden"
        cardClassName="flex-shrink-0 w-[60vw] md:w-[30vw] lg:w-[22vw] xl:w-[18vw] min-w-0"
        sizes="(max-width: 768px) 60vw, (max-width: 1024px) 30vw, 18vw"
      />
    </div>
  );
}
