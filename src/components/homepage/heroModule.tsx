import { type HeroModule } from "../../../sanity.types";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

/**
 * Render a hero section that displays either a hotspot-positioned background image or an autoplaying muted video, with a bottom-aligned heading, subparagraph, and call-to-action link.
 *
 * @param heroModule - Configuration and content for the hero, including `mediaType`, `heroImage` or `heroVideo`, `height`, `textColor`, `heroHeading`, `heroSubparagraph`, `buttonText`, and `buttonLink`.
 * @returns A JSX element representing the rendered hero section.
 */
function HeroModule({ heroModule }: { heroModule: HeroModule }) {
  // Type assertion for resolved video asset from GROQ query
  const heroVideo = heroModule.heroVideo as {
    asset?: { url?: string };
  } | null;

  const videoUrl = heroVideo?.asset?.url;
  const shouldShowVideo = heroModule.mediaType === "video" && !!videoUrl;

  // Ensure height is always a valid vh value
  const height =
    heroModule.height && heroModule.height.includes("vh")
      ? heroModule.height
      : "100vh";

  // Get hotspot data for image positioning (defaults to center)
  const hotspot = heroModule.heroImage?.hotspot;
  const objectPosition =
    hotspot?.x !== undefined && hotspot?.y !== undefined
      ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
      : "center center";

  return (
    <div className="w-full">
      <div
        className="flex w-full items-center relative overflow-hidden"
        style={{ height, minHeight: height }}
      >
        {/* Background Image with hotspot-based positioning */}
        {heroModule.mediaType === "image" && heroModule.heroImage?.asset && (
          <Image
            src={urlFor(heroModule.heroImage).url()}
            alt={heroModule.heroImage.alt || ""}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition }}
            fill
            priority
          />
        )}

        {/* Video */}
        {shouldShowVideo && videoUrl && (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        <div
          className={`${
            heroModule.textColor === "white" ? "text-white" : "text-black"
          } mt-auto mb-8 md:mb-12 xl:mb-16 relative z-20`}
        >
          <h1
            className={`${
              heroModule.textColor === "white" ? "text-white" : "text-black"
            } text-sm ml-2`}
          >
            {heroModule.heroHeading}
          </h1>
          <p
            className={`${
              heroModule.textColor === "white" ? "text-white" : "text-black"
            } text-xs ml-2 mt-2 w-[70vw] md:w-[60vw] lg:w-[50vw]`}
          >
            {heroModule.heroSubparagraph}
          </p>
          <div className="flex items-center">
            <Link
              href={heroModule.buttonLink || "/"}
              className={`${
                heroModule.textColor === "white" ? "text-white" : "text-black"
              } text-xs ml-2 mt-4 flex items-center`}
            >
              {heroModule.buttonText}
              <svg
                aria-hidden="true"
                viewBox="0 0 5 8"
                className={`w-2 h-2 ml-1.5 mt-0.5 ${
                  heroModule.textColor === "white" ? "text-white" : "text-black"
                }`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroModule;