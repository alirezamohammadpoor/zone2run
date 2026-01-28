import type { Metadata, Viewport } from "next";
import "../globals.css";
import HeaderServer from "@/components/HeaderServer";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FooterContent } from "@/components/Footer";
import PreviewProvider from "@/components/PreviewProvider";
import { OrganizationJsonLd } from "@/components/schemas";

export const metadata: Metadata = {
  title: {
    default: "Zone2Run",
    template: "%s | Zone2Run",
  },
  description: "Purposefully Curated. Built to Perform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* DNS Prefetch - resolve domain names early */}
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        <link rel="dns-prefetch" href="//cdn.shopify.com" />

        {/* Preconnect - establish early connections to critical origins */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />

        {/* Organization JSON-LD for SEO */}
        <OrganizationJsonLd />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline focus:outline-2 focus:outline-black"
        >
          Skip to main content
        </a>
        <PreviewProvider />
        <ScrollRestoration />
        <HeaderServer />
        <main id="main-content" className="relative" tabIndex={-1}>
          <div className="relative bg-white">
            {children}
            <FooterContent />
          </div>
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
