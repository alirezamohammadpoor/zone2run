import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        <Header />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
