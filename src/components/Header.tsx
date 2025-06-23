import React from "react";
import { getSiteSettings } from "@/sanity/lib/getData";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

async function Header() {
  try {
    const siteSettings = await getSiteSettings();
    console.log("Site Settings:", siteSettings);
    console.log("Header Logo:", siteSettings?.headerLogo);

    return (
      <header>
        <div className="bg-black text-white text-center h-8">
          Free standard shipping on orders over $100
        </div>
        <nav className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 ml-4">
            <Link href="/">
              {siteSettings?.headerLogo ? (
                <Image
                  src={urlFor(siteSettings.headerLogo)
                    .width(50)
                    .height(50)
                    .url()}
                  alt={siteSettings.headerLogo.alt || "Logo"}
                  width={50}
                  height={50}
                />
              ) : (
                <span className="text-xl font-bold">Zone 2</span>
              )}
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-auto mr-4">
            <span>Search</span>
            <span>Cart</span>
            <span>Menu</span>
          </div>
        </nav>
      </header>
    );
  } catch (error) {
    console.error("Error loading site settings:", error);
    // Fallback header without site settings
    return (
      <header>
        <div className="bg-black text-white text-center h-8">
          Free standard shipping on orders over $100
        </div>
        <nav className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 ml-4">
            <Link href="/">
              <span className="text-xl font-bold">Zone 2</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-auto mr-4">
            <span>Search</span>
            <span>Cart</span>
            <span>Menu</span>
          </div>
        </nav>
      </header>
    );
  }
}

export default Header;
