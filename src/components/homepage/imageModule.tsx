import { type ImageModule } from "../../../sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import PortableTextRenderer from "@/components/PortableTextRenderer";

function ImageModuleComponent({ imageModule }: { imageModule: ImageModule }) {
  // Type assertion for resolved video asset from GROQ query
  const video = imageModule.video as any;

  return (
    <div className="w-full mt-16">
      <div
        className="relative w-full"
        style={{ height: imageModule.imageHeight }}
      >
        {imageModule.mediaType === "video" && video?.asset?.url ? (
          <video
            src={video.asset.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : imageModule.mediaType === "image" && imageModule.image ? (
          <Image
            src={urlFor(imageModule.image).url()}
            alt={imageModule.image.alt || ""}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      {imageModule.content && (
        <PortableTextRenderer
          value={imageModule.content}
          className="mt-8 max-w-4xl ml-2"
        />
      )}
    </div>
  );
}

export default ImageModuleComponent;
