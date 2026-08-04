import type { Metadata } from "next";
import "../../../globals.css";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Zone2Run Studio",
  description: "Content Management Studio",
};

// cacheComponents requires at least the root value of the optional catch-all
// to prerender; [] is /studio itself, deeper tool paths resolve client-side
export function generateStaticParams() {
  return [{ tool: [] }];
}

/**
 * Isolated layout for Sanity Studio
 *
 * This layout is completely separate from the main app layout.
 * It does NOT include:
 * - Header/Footer (not needed in Studio)
 * - VisualEditing/SanityLive (Studio has its own preview system)
 * - ScrollRestoration (Studio manages its own scroll)
 * - Analytics/SpeedInsights (optional for admin area)
 *
 * This isolation ensures Sanity Studio dependencies (CodeMirror, Sanity UI, etc.)
 * are NOT bundled with the main application, reducing the main bundle by ~3-5MB.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Studio renders full-screen, no additional wrapper needed */}
        {children}
      </body>
    </html>
  );
}
