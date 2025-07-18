import { getAllProducts } from "@/lib/product/getAllProducts";
import ProductGrid from "@/components/ProductGrid";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6 mt-10 ml-2">
        Purposefully Curated. Built to Perform.
      </h1>
      <p className="text-sm ml-2 mr-4 mb-10">
        Every piece is carefully curated and made with premium technical
        fabrics. Designed for endurance, comfort, and clarity — nothing extra,
        just what runners need.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
