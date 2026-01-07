import { draftMode } from "next/headers";
import { getHomepage } from "@/sanity/lib/getData";
import HomePageSanity from "@/components/homepage/HomePageSanity";
import { notFound } from "next/navigation";

// ISR: Revalidate every 5 minutes, on-demand via Sanity webhook
export const revalidate = 300;

export default async function Home() {
  const { isEnabled: isPreview } = await draftMode();

  try {
    const homepage = await getHomepage(isPreview);

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
