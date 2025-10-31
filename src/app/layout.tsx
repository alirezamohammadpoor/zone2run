import type { Metadata } from "next";
import "./globals.css";
import HeaderServer from "@/components/HeaderServer";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";

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
      <body>
        <ScrollRestoration />
        <HeaderServer />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
