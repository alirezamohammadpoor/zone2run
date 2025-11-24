import { notFound } from "next/navigation";
import ProductGridWithImages from "@/components/ProductGridWithImages";
import { getCollectionBySlug } from "@/sanity/lib/getData";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection || !collection.products || collection.products.length === 0) {
    notFound();
  }

  return (
    <div>
      <div className="mb-12 px-2">
        <h1 className="text-2xl mt-4">{collection.title}</h1>
        <p className="text-sm mt-2">{collection.description || ""}</p>
      </div>
      <ProductGridWithImages
        products={collection.products}
        editorialImages={collection.editorialImages}
        productsPerImage={2}
      />
    </div>
  );
}
