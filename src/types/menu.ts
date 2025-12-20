// Types for menu/navigation components
// These represent simplified query results from getAllBrands(), getAllCollections(),
// getSubcategoriesByParentAndGender(), and getSubSubcategoriesByParentAndGender()

export type BrandMenuItem = {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  logo?: {
    asset?: {
      url: string;
    };
  };
  productCount?: number;
  featured?: boolean;
};

export type CollectionMenuItem = {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  menuImage?: {
    asset?: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
};

export type SubSubcategoryMenuItem = {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  productCount?: number;
  sortOrder?: number;
  parentCategory?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
  };
};

export type SubcategoryMenuItem = {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  categoryType?: string;
  parentCategory?: {
    title: string;
    slug: {
      current: string;
    };
  };
  subSubcategories?: SubSubcategoryMenuItem[];
};

export type MenuData = {
  [gender: string]: {
    [mainCategorySlug: string]: SubcategoryMenuItem[];
  };
};

export type BlogPostMenuItem = {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  category?: {
    title: string;
    slug: {
      current: string;
    };
  };
  featuredImage?: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
};

export type MenuConfig = {
  men?: {
    featuredCollections?: CollectionMenuItem[];
  };
  women?: {
    featuredCollections?: CollectionMenuItem[];
  };
  help?: {
    links?: Array<{ label: string; url: string; _key?: string }>;
  };
  ourSpace?: {
    links?: Array<{ label: string; url: string; _key?: string }>;
  };
};
