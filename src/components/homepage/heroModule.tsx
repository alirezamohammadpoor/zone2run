import React from "react";
import { type HeroModule } from "../../../sanity.types";
import Image from "next/image";
import Link from "next/link";

function HeroModule({ heroModule }: { heroModule: HeroModule }) {
  return (
    <div className="w-full">
      <div
        className={`flex w-full h-[${heroModule.height}] items-center relative`}
      >
        {/* Background Media */}
        {heroModule.mediaType === "image" &&
          heroModule.heroImage?.asset?.url && (
            <Image
              src={heroModule.heroImage.asset.url}
              alt={heroModule.heroImage.alt || ""}
              className="absolute inset-0 w-full h-full object-cover"
              fill
            />
          )}

        {(heroModule.mediaType === "video" ||
          (heroModule.mediaType === "image" &&
            !heroModule.heroImage?.asset?.url)) &&
          heroModule.heroVideo?.asset?.url && (
            <video
              src={heroModule.heroVideo.asset.url}
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
