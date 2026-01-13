"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../sanity.config";

/**
 * Studio component wrapping NextStudio.
 * This is dynamically imported to isolate the heavy Sanity SDK (~6MB)
 * from the main app bundle. The SDK only loads when visiting /studio.
 */
export default function Studio() {
  return <NextStudio config={config} />;
}
