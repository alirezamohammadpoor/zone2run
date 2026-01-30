import { genderMetadata, GenderPage } from "@/lib/utils/genderRouteHelpers";

export const metadata = genderMetadata("womens");

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default function WomensPage() {
  return <GenderPage gender="womens" />;
}
