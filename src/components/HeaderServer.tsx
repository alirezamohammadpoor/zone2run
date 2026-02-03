import { getAllBrands, getMenu } from "@/sanity/lib/getData";
import { getFullMenuData } from "@/sanity/lib/getCategories";
import { getBlogPostsForMenu } from "@/sanity/lib/getBlog";
import Header from "./Header";

export default async function HeaderServer() {
  // Fetch all header data in parallel (4 queries total instead of 20+)
  const [menuData, brands, menuConfig, blogPosts] = await Promise.all([
    getFullMenuData(), // 2 queries: one per gender, fetches full category hierarchy
    getAllBrands(),
    getMenu(),
    getBlogPostsForMenu(10),
  ]);

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
