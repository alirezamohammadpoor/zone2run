import React from "react";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { getCollectionBySlug } from "@/sanity/lib/getData";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">{collection.title}</h1>
      {collection.products && collection.products.length > 0 ? (
        <ProductGrid products={collection.products} />
      ) : (
        <p>No products found in this collection.</p>
      )}
    </div>
  );
}
