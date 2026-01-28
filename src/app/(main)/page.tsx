import { getHomepage } from "@/sanity/lib/getData";
import HomePageSanity from "@/components/homepage/HomePageSanity";
import { notFound } from "next/navigation";
import { homeMetadata } from "@/lib/metadata";

export const metadata = homeMetadata;

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function Home() {
  try {
    // Preview mode is handled client-side by PreviewProvider
    const homepage = await getHomepage();

    if (!homepage) {
      console.error("No homepage data found");
      notFound();
    }

    return (
      <HomePageSanity homepage={homepage} />
    );
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return (
      <div className="p-8">
        <h1>Error loading homepage</h1>
        <p>
          There was an error loading the homepage content. Please try again
          later.
        </p>
      </div>
    );
  }
}
