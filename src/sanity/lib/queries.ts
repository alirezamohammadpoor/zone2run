export const getAllProducts = `*[_type == "product" && defined(title) && title != null] {
  _id,
  title,
  shopifyId,
  shopifyHandle,
  shortDescription,
  mainImage,
  featured,
  category-> {
    title,
    slug
  },
  brand-> {
    name,
    slug
  }
}`;

export const getFeaturedProducts = `*[_type == "product" && featured == true] {
  _id,
  title,
  shopifyId,
  shopifyHandle,
  shortDescription,
  mainImage,
  featured,
  category-> {
    title,
    slug
  },
  brand-> {
    name,
    slug
  }
}`;

export const getProductByHandle = `*[_type == "product" && shopifyHandle == $handle][0] {
  _id,
  title,
  shopifyId,
  shopifyHandle,
  description,
  shortDescription,
  mainImage,
  gallery,
  featured,
  tags,
  category-> {
    _id,
    title,
    slug
  },
  brand-> {
    _id,
    name,
    slug,
    logo
  },
  productDetails,
  careInstructions,
  seo
}`;

export const getAllCategories = `*[_type == "category"] | order(sortOrder asc) {
  _id,
  title,
  slug,
  description,
  image,
  featured,
  "productCount": count(*[_type == "product" && references(^._id)])
}`;

export const getCategoryBySlug = `*[_type == "category" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  image,
  featured,
  "products": *[_type == "product" && references(^._id)] | order(_createdAt desc) {
    _id,
    title,
    shopifyId,
    shopifyHandle,
    shortDescription,
    mainImage,
    featured,
    brand-> {
      name,
      slug
    }
  }
}`;

export const getAllBrands = `*[_type == "brand"] | order(name asc) {
  _id,
  name,
  slug,
  description,
  logo,
  featured,
  website,
  "productCount": count(*[_type == "product" && references(^._id)])
}`;

export const getBrandBySlug = `*[_type == "brand" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  logo,
  featured,
  website,
  "products": *[_type == "product" && references(^._id)] | order(_createdAt desc) {
    _id,
    title,
    shopifyId,
    shopifyHandle,
    shortDescription,
    mainImage,
    featured,
    category-> {
      title,
      slug
    }
  }
}`;

export const getSiteSettings = `*[_type == "siteSettings"][0] {
  title,
  description,
  headerLogo,
  mainHeroImage,
  logo,
  socialMediaLinks,
  callToActionText,
  pricingDetails
}`;

export const getProductsByCategory = `*[_type == "product" && references($categoryId)] | order(_createdAt desc) {
  _id,
  title,
  shopifyId,
  shopifyHandle,
  shortDescription,
  mainImage,
  featured,
  brand-> {
    name,
    slug
  }
}`;

export const getProductsByBrand = `*[_type == "product" && references($brandId)] | order(_createdAt desc) {
  _id,
  title,
  shopifyId,
  shopifyHandle,
  shortDescription,
  mainImage,
  featured,
  category-> {
    title,
    slug
  }
}`;

export const searchProducts = `*[_type == "product" && (
  title match $searchTerm + "*" ||
  shortDescription match $searchTerm + "*" ||
  tags[] match $searchTerm + "*"
)] {
  _id,
  title,
  shopifyId,
  shopifyHandle,
  shortDescription,
  mainImage,
  featured,
  category-> {
    title,
    slug
  },
  brand-> {
    name,
    slug
  }
}`;
