import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// Create client with API token for write operations
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  token:
    "skbl7GpO3QsBCLrP25dko8JEhKG0lFmKLCFFHCjMi62blGWGM4GoIbr5USQwgZ0PpU6VBIhCfj6wkZ0KUSC58h7Ag54IWkglbF9CMvGQPDG11Aw40K7VD6VdnGNVmLwtg9tqrTK1p4Og9bvX4mTrJ5VSENbGhA6eCzn4RGi3WGWdySNN6Uvu",
});

/**
 * Custom Sanity Connect sync handler
 * This prevents the default sync from creating untitled products
 * and implements our new schema structure with shopify object
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, products, productIds } = body;

    console.log(`🔄 Sanity Connect sync: ${action}`, {
      productCount: products?.length || 0,
      productIds: productIds?.length || 0,
    });

    const transaction = sanityClient.transaction();

    switch (action) {
      case "create":
      case "update":
      case "sync":
        if (products && products.length > 0) {
          await createOrUpdateProducts(transaction, products);
        }
        break;
      case "delete":
        if (productIds && productIds.length > 0) {
          await deleteProducts(transaction, productIds);
        }
        break;
    }

    await transaction.commit();

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Sync handler error:", error);
    return NextResponse.json({ error: "Sync handler failed" }, { status: 500 });
  }
}

/**
 * Creates or updates products using our new schema structure
 * This prevents untitled products and uses the shopify object
 */
async function createOrUpdateProducts(transaction: any, products: any[]) {
  for (const product of products) {
    const productId = extractIdFromGid(product.id);
    const documentId = `product-${productId}`;

    // Build our new schema structure
    const document = {
      _id: documentId,
      _type: "product",
      shopify: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        descriptionHtml: product.descriptionHtml,
        status: product.status,
        vendor: product.vendor,
        productType: product.productType,
        options: product.options?.map((option: any, index: number) => ({
          _key: String(index),
          name: option.name,
          position: option.position,
          values: option.values,
        })),
        variants: product.variants?.map((variant: any, index: number) => {
          const variantId = extractIdFromGid(variant.id);
          return {
            _key: String(index),
            id: variantId,
            title: variant.title,
            price: Number(variant.price || 0),
            compareAtPrice: Number(variant.compareAtPrice || 0),
            sku: variant.sku,
            inStock: !!variant.inventoryManagement
              ? variant.inventoryPolicy === "continue" ||
                variant.inventoryQuantity > 0
              : true,
            inventoryManagement: variant.inventoryManagement,
            inventoryPolicy: variant.inventoryPolicy,
            selectedOptions: variant.selectedOptions,
          };
        }),
        images: product.images?.map((image: any, index: number) => ({
          _key: String(index),
          id: image.id,
          url: image.url,
          altText: image.altText,
          width: image.width,
          height: image.height,
        })),
        priceRange: product.priceRange,
      },
      // Sanity-only fields (can be customized)
      mainImage: null, // Override field
      gallery: [], // Sanity-only gallery
      careInstructions: null,
      sustainabilityTags: [],
      seo: {
        title: null,
        description: null,
      },
      category: null,
      brand: null,
      gender: null,
      featured: false,
      tags: [], // Custom tags
    };

    // Create or update the product
    transaction
      .createIfNotExists(document)
      .patch(documentId, (patch: any) => patch.set(document));

    console.log(`✅ Processed product: ${product.title}`);
  }
}

/**
 * Delete products from Sanity
 */
async function deleteProducts(transaction: any, productIds: string[]) {
  for (const productId of productIds) {
    const documentId = `product-${extractIdFromGid(productId)}`;
    transaction.delete(documentId).delete(`drafts.${documentId}`);
    console.log(`🗑️ Deleted product: ${documentId}`);
  }
}

/**
 * Extract ID from Shopify GID string
 * e.g. gid://shopify/Product/12345 => 12345
 */
function extractIdFromGid(gid: string): string {
  return gid?.match(/[^\/]+$/i)?.[0] || gid;
}
