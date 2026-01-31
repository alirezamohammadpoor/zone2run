import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardGallery from "./ProductCardGallery";
import type { CardProduct } from "@/types/cardProduct";

interface ProductCardProps {
  product: CardProduct;
  sizes?: string;
  className?: string;
  priority?: boolean;
  disableGallery?: boolean;
  availableSizes?: string[];
}

export default function ProductCard({
  product,
  sizes = "(max-width: 1279px) calc(50vw - 12px), calc(25vw - 10px)",
  className = "",
  priority = false,
  disableGallery = false,
  availableSizes,
}: ProductCardProps) {
  // images[0] = main image, rest = gallery (combined at GROQ level)
  const allImages = (product.images || []).filter((img) => Boolean(img?.url));

  const brandName = product.brand?.name || product.vendor || "";
  const price = formatPrice(product.priceRange.minVariantPrice);
  const hasSizes = availableSizes && availableSizes.length > 0;

  return (
    <article className={`aspect-[4/5] flex flex-col group/card ${className}`}>
      <div className="w-full h-full relative bg-gray-100 block">
        <ProductCardGallery
          images={allImages}
          sizes={sizes}
          priority={priority}
          disableGallery={disableGallery}
        />
      </div>
      <div className="pt-2 pb-4">
        {/* Default text — hidden on desktop hover when sizes exist */}
        <p className={`text-xs font-medium ${hasSizes ? "xl:group-hover/card:hidden" : ""}`}>
          {brandName}
        </p>
        <p className={`text-xs line-clamp-1 ${hasSizes ? "xl:group-hover/card:hidden" : ""}`}>
          {product.title}
        </p>
        {/* Hover text — visible only on desktop hover when sizes exist */}
        {hasSizes && (
          <>
            <p className="hidden xl:group-hover/card:block text-xs font-medium">
              Available in
            </p>
            <p className="hidden xl:group-hover/card:block text-xs line-clamp-1">
              {availableSizes.join("  ")}
            </p>
          </>
        )}
        <p className="text-xs pt-2">
          {price} {product.priceRange.currencyCode || "SEK"}
        </p>
      </div>
    </article>
  );
}
