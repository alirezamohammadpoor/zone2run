import Image from "next/image";
import Link from "next/link";
import { getNotFoundPage } from "@/sanity/lib/getSettings";

export default async function NotFound() {
  const notFoundData = await getNotFoundPage();

  // Fallback content if no Sanity data
  const title = notFoundData?.title || "Page Not Found";
  const body =
    notFoundData?.body || "The page you're looking for doesn't exist.";
  const image = notFoundData?.image;
  const buttons = notFoundData?.buttons || [{ text: "Go Home", link: "/" }];

  return (
    <div className="relative w-full h-[calc(100vh-60px)]">
      {/* Background Image */}
      {image?.asset?.url && (
        <Image
          src={image.asset.url}
          alt={image.alt || "404 background"}
          fill
          className="object-cover"
          style={{
            objectPosition: image.hotspot
              ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
              : "center",
          }}
          priority
        />
      )}

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 w-full h-full">
        <h1 className="text-xl text-white mb-4">{title}</h1>
        {body && <p className="text-sm text-white mb-8">{body}</p>}

        {/* Buttons */}
        <div className="flex gap-4">
          {buttons.map(
            (button: { text: string; link: string }, index: number) => (
              <Link
                key={index}
                href={button.link}
                className="px-6 py-3 bg-white text-black text-xs hover:bg-gray-100 transition-colors"
              >
                {button.text}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
