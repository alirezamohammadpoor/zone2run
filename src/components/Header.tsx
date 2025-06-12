import React from "react";
import { getSiteSettings } from "@/sanity/lib/siteSettings/getSiteSettings";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

async function Header() {
  const siteSettings = await getSiteSettings();
  console.log("Site Settings:", siteSettings);
  console.log("Header Logo:", siteSettings?.headerLogo);

  return (
    <header className="w-full py-4 px-6 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          {siteSettings?.headerLogo?.asset?._id && (
            <Image
              src={urlFor(siteSettings.headerLogo).width(100).height(100).url()}
              alt={siteSettings.headerLogo.alt || "Site Logo"}
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          )}
          {siteSettings?.title && (
            <h2 className="text-xl font-semibold">{siteSettings.title}</h2>
          )}
        </Link>
      </div>
    </header>
  );
}

export default Header;
