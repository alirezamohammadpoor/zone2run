import { getAllMainCategories } from "@/sanity/lib/getData";
import {
  getSubcategoriesByParentAndGender,
  getSubSubcategoriesByParentAndGender,
  getAllBrands,
  getMenu,
} from "@/sanity/lib/getData";
import Header from "./Header";
import type { MenuData, MenuConfig } from "@/types/menu";

export default async function HeaderServer() {
  // Fetch main categories
  const mainCategories = await getAllMainCategories();
  const brands = await getAllBrands();
  const menuConfig = await getMenu();

  if (!menuConfig) {
    console.warn("No menu configuration found");
  }

  if (!brands || brands.length === 0) {
    console.warn("No brands found");
  }

  if (!mainCategories || mainCategories.length === 0) {
    console.warn("No main categories found");
  }

  const genders = ["men", "women"];
  const menuData: MenuData = {};

  for (const gender of genders) {
    menuData[gender] = {};

    for (const category of mainCategories) {
      if (!category.slug?.current) {
        console.warn(`Category ${category.title} has no slug`);
        continue;
      }

      try {
        const subcategories = await getSubcategoriesByParentAndGender(
          category.slug.current,
          gender
        );

        // Also fetch sub-subcategories for each subcategory
        const subcategoriesWithChildren = await Promise.all(
          (subcategories || []).map(async (subcategory: any) => {
            try {
              const subSubcategories =
                await getSubSubcategoriesByParentAndGender(
                  subcategory.slug.current,
                  gender
                );
              return {
                ...subcategory,
                subSubcategories: subSubcategories || [],
              };
            } catch (error) {
              console.error(
                `Error fetching sub-subcategories for ${subcategory.slug.current}:`,
                error
              );
              return {
                ...subcategory,
                subSubcategories: [],
              };
            }
          })
        );

        menuData[gender][category.slug.current] = subcategoriesWithChildren;
      } catch (categoryError) {
        console.error(
          `Error fetching subcategories for ${category.slug.current}:`,
          categoryError
        );
        menuData[gender][category.slug.current] = [];
      }
    }
  }

  return (
    <Header menuData={menuData} brands={brands} menuConfig={menuConfig} />
  );
}
