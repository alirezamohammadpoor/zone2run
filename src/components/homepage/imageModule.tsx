import { type ImageModule } from "../../../sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import PortableTextRenderer from "@/components/PortableTextRenderer";

/**
 * Render a responsive media block that displays either a video or an image with optional portable text content.
 *
 * Renders a container whose height is taken from `imageModule.imageHeight`. If `imageModule.mediaType` is `"video"` and a video URL is available, a muted, looping, autoplaying video is rendered to fill the container. If `imageModule.mediaType` is `"image"` and an image is provided, a Next.js `Image` is rendered to fill the container with `priority` enabled. If `imageModule.content` is present, it is rendered below the media using the portable text renderer.
 *
 * @param imageModule - Module data containing media and optional content. Expected fields:
 *   - `mediaType`: either `"video"` or `"image"` to select the media rendering path.
 *   - `video?.asset?.url`: optional video source URL used when `mediaType` is `"video"`.
 *   - `image`: image asset and metadata used when `mediaType` is `"image"` (its `alt` may be used).
 *   - `imageHeight`: CSS height value applied to the media container.
 *   - `content`: optional portable text value rendered beneath the media.
 * @returns A JSX element that displays either the selected video or image (image uses `priority`) and optional portable text content.
 */
function ImageModuleComponent({ imageModule }: { imageModule: ImageModule }) {
  // Type assertion for resolved video asset from GROQ query
  const video = imageModule.video as {
    asset?: { url?: string };
  } | null;

  const videoUrl = video?.asset?.url;

  return (
    <div className="w-full my-8 md:my-12 xl:my-16">
      <div
        className="relative w-full"
        style={{ height: imageModule.imageHeight }}
      >
        {imageModule.mediaType === "video" && videoUrl ? (
          <video
            src={videoUrl}
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
            priority
          />
        ) : null}
      </div>
      {imageModule.content && (
        <PortableTextRenderer
          value={imageModule.content}
          className="mt-8 max-w-4xl px-2"
        />
      )}
    </div>
  );
}

export default ImageModuleComponent;