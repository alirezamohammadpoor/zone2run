import ProductGalleryServer from "@/components/product/ProductGalleryServer";
import ProductInfo from "@/components/product/ProductInfo";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import RelatedProductsServer from "@/components/product/RelatedProductsServer";
import ColorVariants from "@/components/product/ColorVariants";
import ProductEditorialImages from "@/components/product/ProductEditorialImages";
import RelatedProductsSkeleton from "@/components/skeletons/RelatedProductsSkeleton";
import EditorialImageSkeleton from "@/components/skeletons/EditorialImageSkeleton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const handle = (await params).handle;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div>
        <div className="xl:flex xl:flex-row">
          <ProductGalleryServer
            mainImage={product.mainImage}
            galleryImages={product.gallery}
            title={product.title}
          />
          <ProductInfo product={product} />
        </div>
        <ColorVariants
          colorVariants={product.colorVariants}
          currentProductId={product._id}
        />
        <Suspense fallback={<EditorialImageSkeleton />}>
          <ProductEditorialImages editorialImages={product.editorialImages} />
        </Suspense>
      </div>
      {product.brand?.slug && (
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsServer
            brandSlug={product.brand.slug}
            currentProductId={product._id}
          />
        </Suspense>
      )}
    </>
  );
}
