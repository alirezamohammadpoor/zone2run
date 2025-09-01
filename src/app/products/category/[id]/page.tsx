import { getAllProducts } from "@/lib/product/getAllProducts";
import ProductGrid from "@/components/ProductGrid";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getAllProducts();

  const categoryProducts = products.filter(
    (product) => product.sanity?.category?.slug?.current === id
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6 mt-10 ml-2">Category: {id}</h1>
      <ProductGrid products={categoryProducts} />
    </div>
  );
}
