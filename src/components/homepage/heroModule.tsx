import React from "react";
import { type HeroModule } from "../../../sanity.types";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

function HeroModule({ heroModule }: { heroModule: HeroModule }) {
  // Type assertion for resolved assets from GROQ query
  const heroVideo = heroModule.heroVideo as any;

  const videoUrl = heroVideo?.asset?.url;
  const shouldShowVideo = heroModule.mediaType === "video" && !!videoUrl;

  return (
    <div className="w-full">
      <div
        className={`flex w-full h-[${heroModule.height}] items-center relative`}
      >
        {/* Background Media */}
        {heroModule.mediaType === "image" && heroModule.heroImage?.asset && (
          <Image
            src={urlFor(heroModule.heroImage).url()}
            alt={heroModule.heroImage.alt || ""}
            className="absolute inset-0 w-full h-full object-cover"
            fill
          />
        )}

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

        <div className={`text-${heroModule.textColor} mt-auto mb-8 relative`}>
          <h1
            className={`text-${heroModule.textColor} text-2xl ml-2 font-bold`}
          >
            {heroModule.heroHeading}
          </h1>
          <p
            className={`text-${heroModule.textColor} text-md font-medium ml-2 mt-4 w-[70vw]`}
          >
            {heroModule.heroSubparagraph}
          </p>
          <div className="flex justify-between items-center">
            <Link
              href={heroModule.buttonLink || "/"}
              className={`text-${heroModule.textColor} text-md font-medium ml-2 mt-4`}
            >
              {heroModule.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroModule;
