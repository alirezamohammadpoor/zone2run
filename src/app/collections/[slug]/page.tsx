import React from "react";
import { notFound } from "next/navigation";
import ProductGridWithImages from "@/components/ProductGridWithImages";
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
    <div>
      {collection.products && collection.products.length > 0 ? (
        <ProductGridWithImages
          products={collection.products}
          editorialImages={collection.editorialImages}
          productsPerImage={2}
        />
      ) : (
        <p>No products found in this collection.</p>
      )}
    </div>
  );
}
