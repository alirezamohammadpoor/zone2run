import type { Metadata } from "next";
import { draftMode } from "next/headers";
import "./globals.css";
import HeaderServer from "@/components/HeaderServer";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import PreviewBanner from "@/components/PreviewBanner";
import VisualEditing from "@/components/VisualEditing";

export const metadata: Metadata = {
  title: "Zone2Run",
  description: "Purposefully Curated. Built to Perform.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isPreview } = await draftMode();

  return (
    <html lang="en">
      <body>
        {isPreview && (
          <>
            <PreviewBanner />
            <VisualEditing />
          </>
        )}
        <ScrollRestoration />
        <HeaderServer />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
