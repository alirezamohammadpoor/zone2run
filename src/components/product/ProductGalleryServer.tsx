import Image from "next/image";
import ProductGalleryClient from "./ProductGalleryClient";

interface ProductGalleryServerProps {
  mainImage: { url: string; alt: string } | null;
  galleryImages?: Array<{ url: string; alt?: string }> | null;
  title?: string;
}

export default function ProductGalleryServer({
  mainImage,
  galleryImages,
  title,
}: ProductGalleryServerProps) {
  // Build images array (same logic as was in client component)
  const images: Array<{ url: string; alt: string }> = [];

  if (mainImage?.url) {
    images.push({
      url: mainImage.url,
      alt: mainImage.alt || title || "Product",
    });
  }

  galleryImages?.forEach((img) => {
    if (img?.url) {
      images.push({ url: img.url, alt: img.alt || title || "Product" });
    }
  });

  const firstImage = images[0];

  if (!firstImage) {
    return (
      <div className="w-full relative aspect-[4/5] flex items-center justify-center bg-gray-100 xl:w-[45vw] 2xl:w-[45vw]">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full xl:w-[45vw] 2xl:w-[45vw]">
      {/* Server-rendered first image - this is in the initial HTML for LCP */}
      <div className="relative aspect-[4/5] xl:h-[92vh]">
        <Image
          src={firstImage.url}
          alt={firstImage.alt}
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="(min-width: 1280px) 50vw, (min-width: 768px) 60vw, 100vw"
        />
      </div>

      {/* Client carousel overlays and takes over for interactivity */}
      <ProductGalleryClient images={images} />
    </div>
  );
}
