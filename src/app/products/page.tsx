import { getAllProducts } from "@/sanity/lib/getData";
import ProductGrid from "@/components/ProductGrid";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6 mt-16 ml-2">
        Purposefully Curated. Built to Perform.
      </h1>
      <p className="text-md ml-2 mr-4 mb-10">
        Every piece is carefully curated and made with premium technical
        fabrics. Designed for endurance, comfort, and clarity — nothing extra,
        just what runners need.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
