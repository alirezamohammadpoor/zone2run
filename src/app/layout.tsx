import type { Metadata } from "next";
import "./globals.css";
import HeaderServer from "@/components/HeaderServer";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FooterContent, StickyFooter } from "@/components/Footer";
import PreviewProvider from "@/components/PreviewProvider";

export const metadata: Metadata = {
  title: "Zone2Run",
  description: "Purposefully Curated. Built to Perform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" />
      </head>
      <body>
        <PreviewProvider />
        <ScrollRestoration />
        <HeaderServer />
        <main className="relative">
          <div className="relative z-20 bg-white">
            {children}
            <FooterContent />
          </div>
          {/* <StickyFooter /> */}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
