import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ScrollRestoration } from "@/components/ScrollRestoration";

const inter = Inter({ subsets: ["latin"] });

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
      <body className="__className_aaf875">
        <ScrollRestoration />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
