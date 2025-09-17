import { getAllBrands } from "@/sanity/lib/getData";
import { Brand } from "../../../sanity.types";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export default async function BrandsPage() {
  const brands = await getAllBrands();

  if (!brands || brands.length === 0) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Brands</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand: Brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug?.current}`}
            className="group block p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            {brand.logo?.asset?._ref && (
              <div className="mb-4">
                <Image
                  src={urlFor(brand.logo).url()}
                  alt={brand.logo.alt || brand.name || "Brand logo"}
                  width={100}
                  height={100}
                  className="w-full h-24 object-contain"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
              {brand.name}
            </h3>
            {brand.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {brand.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
