import { genderMetadata, GenderPage } from "@/lib/utils/genderRouteHelpers";

export const metadata = genderMetadata("mens");

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default function MensPage() {
  return <GenderPage gender="mens" />;
}
