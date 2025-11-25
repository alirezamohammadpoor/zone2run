import { NextRequest, NextResponse } from "next/server";
import { webhookSanityClient } from "@/lib/shopify-webhook-utils";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Finding SOAR brand...");

    // Find the SOAR brand (case-insensitive)
    const soarBrand = await webhookSanityClient.fetch(
      `*[_type == "brand" && (name == "SOAR" || lower(name) == "soar" || lower(name) match "soar*")][0] {
        _id,
        name
      }`
    );

    if (!soarBrand) {
      return NextResponse.json(
        { error: "SOAR brand not found. Please create it first." },
        { status: 404 }
      );
    }

    console.log(`✅ Found SOAR brand: ${soarBrand._id} (${soarBrand.name})`);

    // Find all products with brands
    console.log("🔍 Finding products with Soar Running brand...");
    const productsToUpdate = await webhookSanityClient.fetch(
      `*[_type == "product" && defined(brand)] {
        _id,
        "title": store.title,
        "currentBrandId": brand._ref,
        "currentBrandName": brand->name
      }`
    );

    // Filter products that have "Soar Running" or similar but not "SOAR"
    const soarRunningProducts = productsToUpdate.filter((product: any) => {
      const brandName = (product.currentBrandName || "").toLowerCase();
      return (
        brandName.includes("soar") &&
        brandName !== "soar" &&
        product.currentBrandId !== soarBrand._id
      );
    });

    console.log(
      `📦 Found ${soarRunningProducts.length} products to update:`
    );
    soarRunningProducts.forEach((p: any) => {
      console.log(`  - ${p.title} (current brand: ${p.currentBrandName})`);
    });

    if (soarRunningProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products need updating.",
        updated: 0,
      });
    }

    // Update products in batches
    const batchSize = 10;
    let updated = 0;

    for (let i = 0; i < soarRunningProducts.length; i += batchSize) {
      const batch = soarRunningProducts.slice(i, i + batchSize);
      const transaction = webhookSanityClient.transaction();

      for (const product of batch) {
        transaction.patch(product._id, (patch) =>
          patch.set({
            brand: {
              _ref: soarBrand._id,
              _type: "reference",
            },
          })
        );
      }

      await transaction.commit();
      updated += batch.length;
      console.log(`✅ Updated ${updated}/${soarRunningProducts.length} products...`);
    }

    // Find old "Soar Running" brands to clean up
    console.log("\n🔍 Finding old Soar Running brands to clean up...");
    const oldBrands = await webhookSanityClient.fetch(
      `*[_type == "brand" && lower(name) match "soar*" && name != "SOAR" && name != "soar"] {
        _id,
        name
      }`
    );

    let deletedBrands = 0;
    if (oldBrands.length > 0) {
      console.log(`Found ${oldBrands.length} old brand(s) to check:`);
      oldBrands.forEach((b: any) => {
        console.log(`  - ${b.name} (${b._id})`);
      });

      // Check if any products still reference these brands
      for (const oldBrand of oldBrands) {
        const productsWithBrand = await webhookSanityClient.fetch(
          `*[_type == "product" && brand._ref == $brandId] { _id }`,
          { brandId: oldBrand._id }
        );

        if (productsWithBrand.length === 0) {
          console.log(`🗑️  Deleting unused brand: ${oldBrand.name}`);
          await webhookSanityClient.delete(oldBrand._id);
          deletedBrands++;
        } else {
          console.log(
            `⚠️  Brand ${oldBrand.name} still has ${productsWithBrand.length} products, skipping deletion`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updated} products to use SOAR brand`,
      updated,
      deletedBrands,
      products: soarRunningProducts.map((p: any) => ({
        id: p._id,
        title: p.title,
        oldBrand: p.currentBrandName,
      })),
    });
  } catch (error) {
    console.error("❌ Error updating brands:", error);
    return NextResponse.json(
      {
        error: "Failed to update brands",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

