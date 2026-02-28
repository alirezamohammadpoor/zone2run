import { sanityFetch } from "@/sanity/lib/live";

export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    productTabs {
      shippingAndReturns,
      payments
    }
  }`;

  try {
    const { data } = await sanityFetch({ query });
    return data as {
      productTabs?: {
        shippingAndReturns?: string;
        payments?: string;
      };
    } | null;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}
