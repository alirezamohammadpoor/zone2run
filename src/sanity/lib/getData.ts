// Re-export all functions for backward compatibility
// This file maintains backward compatibility while the codebase is migrated to use the new modular structure

export {
  getSanityProductByHandle,
  getAllProducts,
  getProductsByBrand,
  getProductsByGender,
  getProductsByPath,
  getProductsBySubcategoryIncludingSubSubcategories,
  getProductsByPath3Level,
  getProductsByIds,
} from "./getProducts";

export {
  getAllMainCategories,
  getSubSubcategoriesByParentAndGender,
  getSubcategoriesByParentAndGender,
} from "./getCategories";

export {
  getAllBrands,
  getBrandBySlug,
} from "./getBrands";

export {
  getAllCollections,
  getCollectionBySlug,
} from "./getCollections";

export {
  getBlogPosts,
  getBlogPost,
} from "./getBlog";

export {
  getHomepage,
} from "./getHomepage";

export {
  getMenu,
} from "./getMenu";
