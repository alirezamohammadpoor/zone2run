import React from "react";
import Link from "next/link";
import { getAllCollections } from "@/sanity/lib/getData";

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">All Collections</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection: any) => (
          <Link
            key={collection._id}
            href={`/collections/${collection.slug.current}`}
          >
            <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold">{collection.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
