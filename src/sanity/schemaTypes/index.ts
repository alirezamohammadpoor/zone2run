import { collectionGroupType } from "./objects/collection/collectionGroupType";
import { collectionLinksType } from "./objects/collection/collectionLinksType";
import { collectionReferenceType } from "./objects/module/collectionReferenceType";
import { collectionRuleType } from "./objects/shopify/collectionRuleType";
import { customProductOptionColorObjectType } from "./objects/customProductOption/customProductOptionColorObjectType";
import { customProductOptionColorType } from "./objects/customProductOption/customProductOptionColorType";
import { customProductOptionSizeObjectType } from "./objects/customProductOption/customProductOptionSizeObjectType";
import { customProductOptionSizeType } from "./objects/customProductOption/customProductOptionSizeType";
import { footerType } from "./objects/global/footerType";
import { heroType } from "./objects/module/heroType";
import { imageWithProductHotspotsType } from "./objects/hotspot/imageWithProductHotspotsType";
import { inventoryType } from "./objects/shopify/inventoryType";
import { linkEmailType } from "./objects/link/linkEmailType";
import { linkExternalType } from "./objects/link/linkExternalType";
import { linkInternalType } from "./objects/link/linkInternalType";
import { linkProductType } from "./objects/link/linkProductType";
import { menuLinksType } from "./objects/global/menuLinksType";
import { menuType } from "./objects/global/menuType";
import { notFoundPageType } from "./objects/global/notFoundPageType";
import { optionType } from "./objects/shopify/optionType";
import { placeholderStringType } from "./objects/shopify/placeholderStringType";
import { priceRangeType } from "./objects/shopify/priceRangeType";
import { productHotspotsType } from "./objects/hotspot/productHotspotsType";
import { productReferenceType } from "./objects/module/productReferenceType";
import { productWithVariantType } from "./objects/shopify/productWithVariantType";
import { proxyStringType } from "./objects/shopify/proxyStringType";
import { seoType } from "./objects/seoType";
import { shopifyCollectionType } from "./objects/shopify/shopifyCollectionType";
import { shopifyProductType } from "./objects/shopify/shopifyProductType";
import { shopifyProductVariantType } from "./objects/shopify/shopifyProductVariantType";
import { spotType } from "./objects/hotspot/spotType";
import { muxVideo } from "./objects/muxVideo";

// Homepage module types
import { heroModule } from "./homepage/heroModule";
import { editorialModule } from "./homepage/editorialModule";
import { spotifyPlaylistsModule } from "./homepage/spotifyPlaylistsModule";
import { imageModule } from "./homepage/imageModule";
import { portableTextModule } from "./homepage/portableTextModule";

// Blog types
import { blogPost } from "./blog/blogPost";
import { blogCategory } from "./blog/blogCategory";
import { blogProductsModule } from "./blog/blogProductsModule";

// Objects used as annotations must be imported first
const annotations = [
  linkEmailType,
  linkExternalType,
  linkInternalType,
  linkProductType,
];

const objects = [
  collectionGroupType,
  collectionLinksType,
  collectionReferenceType,
  collectionRuleType,
  customProductOptionColorObjectType,
  customProductOptionColorType,
  customProductOptionSizeObjectType,
  customProductOptionSizeType,
  footerType,
  heroType,
  imageWithProductHotspotsType,
  inventoryType,
  menuLinksType,
  menuType,
  notFoundPageType,
  optionType,
  placeholderStringType,
  priceRangeType,
  productHotspotsType,
  productReferenceType,
  productWithVariantType,
  proxyStringType,
  seoType,
  shopifyCollectionType,
  shopifyProductType,
  shopifyProductVariantType,
  spotType,
  muxVideo,
  // Homepage modules
  heroModule,
  editorialModule,
  spotifyPlaylistsModule,
  imageModule,
  portableTextModule,
  // Blog modules
  blogProductsModule,
];

import { portableTextType } from "./portableText/portableTextType";
import { portableTextSimpleType } from "./portableText/portableTextSimpleType";

const blocks = [portableTextType, portableTextSimpleType];

import brandType from "./brand";
import categoryType from "./category";
import { collectionType } from "./documents/collection";
import { colorThemeType } from "./documents/colorTheme";
import { pageType } from "./documents/page";
import { productType } from "./documents/product";
import { productVariantType } from "./documents/productVariant";
import { homepageVersionType } from "./documents/homepageVersion";

const documents = [
  brandType,
  categoryType,
  collectionType,
  colorThemeType,
  pageType,
  productType,
  productVariantType,
  homepageVersionType,
  // Blog documents
  blogPost,
  blogCategory,
];

import { homeType } from "./singletons/homeType";
import { navigationMenuType } from "./singletons/menuType";
import { settingsType } from "./singletons/settingsType";
import { siteSettingsType } from "./singletons/siteSettings";

const singletons = [homeType, navigationMenuType, settingsType, siteSettingsType];

export const schemaTypes = [
  ...annotations,
  ...objects,
  ...singletons,
  ...blocks,
  ...documents,
];
