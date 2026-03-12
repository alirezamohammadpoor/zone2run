import { getCachedHeaderData } from "@/sanity/lib/getHeaderData";
import Header from "./Header";

export default async function HeaderServer() {
  const { menuData, brands, menuConfig, blogPosts } =
    await getCachedHeaderData();

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
