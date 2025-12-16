import { getAllBrands } from "@/sanity/lib/getData";
import { Brand } from "../../../sanity.types";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { getBrandUrl } from "@/lib/utils/brandUrls";

export default async function BrandsPage() {
  const brands = await getAllBrands();

  if (!brands || brands.length === 0) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-base mb-8">All Brands</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand: Brand) => (
          <Link
            key={brand._id}
            href={
              brand.slug?.current ? getBrandUrl(brand.slug.current) : "/brands"
            }
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
            <h3 className="text-base group-hover:text-blue-600 transition-colors">
              {brand.name}
            </h3>
            {brand.description && (
              <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                {brand.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
