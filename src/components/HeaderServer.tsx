import { unstable_cache } from "next/cache";
import { getAllBrands, getMenu } from "@/sanity/lib/getData";
import { getFullMenuData } from "@/sanity/lib/getCategories";
import { getBlogPosts } from "@/sanity/lib/getBlog";
import Header from "./Header";

// Cache header data to prevent re-fetching on every navigation
const getCachedHeaderData = unstable_cache(
  async () => {
    const [menuData, brands, menuConfig, blogPosts] = await Promise.all([
      getFullMenuData(),
      getAllBrands(),
      getMenu(),
      getBlogPosts(10),
    ]);
    return { menuData, brands, menuConfig, blogPosts };
  },
  ["header-data"],
  { revalidate: 300 } // Cache for 5 minutes
);

export default async function HeaderServer() {
  // Fetch all header data from cache (4 queries total instead of 20+)
  const { menuData, brands, menuConfig, blogPosts } = await getCachedHeaderData();

  if (!menuConfig) {
    console.warn("No menu configuration found");
  }

  if (!brands || brands.length === 0) {
    console.warn("No brands found");
  }

  return (
    <Header
      menuData={menuData}
      brands={brands}
      menuConfig={menuConfig}
      blogPosts={blogPosts}
    />
  );
}
