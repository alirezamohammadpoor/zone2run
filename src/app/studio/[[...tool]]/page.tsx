"use client";

import dynamic from "next/dynamic";

// Dynamically import NextStudio with SSR disabled
const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  { ssr: false }
);

import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
