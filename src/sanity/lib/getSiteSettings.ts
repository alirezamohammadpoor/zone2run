import { sanityFetch } from "@/sanity/lib/client";

export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    productTabs {
      shippingAndReturns,
      payments
    }
  }`;

  try {
    return await sanityFetch<{
      productTabs?: {
        shippingAndReturns?: string;
        payments?: string;
      };
    } | null>(query);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}
