import { getProducts } from "@/lib/shopify/products";
import Image from "next/image";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group"
          >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              {product.image.url && (
                <Image
                  src={product.image.url}
                  alt={product.image.altText || product.title}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                {product.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {product.description}
              </p>
              <p className="mt-2 text-lg font-medium text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: product.price.currencyCode,
                }).format(parseFloat(product.price.amount))}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
