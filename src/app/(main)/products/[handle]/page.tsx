import type { Metadata } from "next";
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

// ISR: Revalidate every 5 minutes, on-demand via Sanity webhook
export const revalidate = 300;

// Allow dynamic params for product handles not generated at build time
export const dynamicParams = true;

// Generate static params for all products (enables ISR)
export async function generateStaticParams() {
  // Return empty array - pages will be generated on-demand and cached
  // This enables ISR behavior: first request generates the page, subsequent requests are cached
  return [];
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const description =
    product.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Shop ${product.title} at Zone2Run`;

  return {
    title: `${product.title} | Zone2Run`,
    description,
    openGraph: {
      title: product.title,
      description,
      url: `${baseUrl}/products/${handle}`,
      siteName: "Zone2Run",
      images: product.mainImage?.url
        ? [
            {
              url: product.mainImage.url,
              alt: product.mainImage.alt || product.title,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.mainImage?.url ? [product.mainImage.url] : [],
    },
  };
}

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
