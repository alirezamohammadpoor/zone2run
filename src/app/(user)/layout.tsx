import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "../../components/Header";
import Hero from "../../components/Hero";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zone2Run",
  description: "Zone2Run",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Header />
        <Hero />
        {children}
      </body>
    </html>
  );
}
