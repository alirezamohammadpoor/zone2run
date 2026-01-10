/**
 * Webhook Types Module
 *
 * Strongly-typed interfaces for Shopify webhook payloads.
 * Replaces `any` types throughout the webhook handler.
 */

// ============================================
// SHOPIFY PRODUCT TYPES
// ============================================

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
}

export interface ShopifyProductPayload {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: "active" | "archived" | "draft";
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: Array<{
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }>;
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

// ============================================
// SHOPIFY COLLECTION TYPES
// ============================================

export interface ShopifyCollectionRule {
  column: string;
  relation: string;
  condition: string;
}

export interface ShopifyCollectionPayload {
  id: number;
  handle: string;
  title: string;
  updated_at: string;
  body_html: string | null;
  published_at: string | null;
  sort_order: string;
  template_suffix: string | null;
  disjunctive: boolean;
  rules: ShopifyCollectionRule[];
  published_scope: string;
  admin_graphql_api_id: string;
  image?: {
    created_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
  };
}

// ============================================
// SANITY DOCUMENT TYPES
// ============================================

export interface SanityImageAsset {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
  alt?: string;
}

export interface SanityReference {
  _ref: string;
  _key?: string;
}

export interface SanitySlug {
  _type: "slug";
  current: string;
}

export interface SanityProductDocument {
  _id: string;
  _type: "product";
  store: {
    id: number;
    gid: string;
    title: string;
    handle: string;
    status: string;
    vendor: string;
    productType: string;
    tags: string;
    descriptionHtml: string | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    priceRange?: {
      minVariantPrice: number;
      maxVariantPrice: number;
    };
    previewImageUrl?: string;
  };
  gender?: string;
  brand?: SanityReference;
  category?: SanityReference;
  collections?: SanityReference[];
  shopifyCollectionIds?: string[];
  mainImage?: SanityImageAsset;
  gallery?: SanityImageAsset[];
}

export interface SanityCollectionDocument {
  _id: string;
  _type: "collection";
  store: {
    id: number;
    gid: string;
    title: string;
    handle: string;
    descriptionHtml: string | null;
    imageUrl?: string;
    rules: Array<{
      _key: string;
      _type: "object";
      column: string;
      condition: string;
      relation: string;
    }>;
    disjunctive: boolean;
    sortOrder: string;
    slug: SanitySlug;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
  };
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
}

// ============================================
// WEBHOOK CONTEXT TYPES
// ============================================

export type WebhookTopic =
  | "products/create"
  | "products/update"
  | "products/delete"
  | "collections/create"
  | "collections/update"
  | "collections/delete";

export interface WebhookHeaders {
  topic: WebhookTopic | null;
  webhookId: string | null;
  eventId: string | null;
  shopDomain: string | null;
  apiVersion: string | null;
  hmac: string | null;
}

export interface WebhookContext {
  headers: WebhookHeaders;
  isRealShopify: boolean;
  timestamp: string;
}

// ============================================
// PROCESSING RESULT TYPES
// ============================================

export interface ProcessingResult {
  success: boolean;
  message: string;
  productId?: string;
  collectionId?: string;
  action?: string;
  processed?: {
    gender?: string | null;
    vendor?: string;
    collections?: number;
    title?: string;
    handle?: string;
    rules?: number;
  };
  error?: string;
  timestamp: string;
}

export interface FailedProductData {
  productId: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string;
  error: string;
  timestamp: string;
  webhookId: string | null;
  eventId: string | null;
}

// ============================================
// BRAND TYPES
// ============================================

export interface SanityBrand {
  _id: string;
  _type: "brand";
  name: string;
  slug?: SanitySlug;
}

// ============================================
// COLLECTION PRODUCT TYPES
// ============================================

export interface ShopifyCollectionProduct {
  id: number;
  title: string;
  handle: string;
}

export interface ProductCollectionUpdate {
  productId: string;
  shopifyId: number;
  currentCollectionRefs: string[];
  currentShopifyIds: string[];
  shouldHaveCollection: boolean;
  hasCollectionRef: boolean;
  hasShopifyId: boolean;
}
