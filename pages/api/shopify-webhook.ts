import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false, // Critical: We need raw body for HMAC
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("=".repeat(80));
  console.log("🔔 WEBHOOK RECEIVED");
  console.log("Time:", new Date().toISOString());
  console.log("=".repeat(80));

  if (req.method !== "POST") {
    console.log("❌ Method not POST:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read raw body from stream
    console.log("\n📦 Reading body from stream...");
    const chunks: Buffer[] = [];

    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks).toString("utf-8");

    console.log("✅ Body read successfully!");
    console.log("Body length:", rawBody.length, "bytes");
    console.log("\n📝 Body preview (first 500 chars):");
    console.log(rawBody.substring(0, 500));

    if (rawBody.length === 0) {
      console.log("❌ Empty body received");
      return res.status(400).json({ error: "Empty body" });
    }

    // Parse JSON
    console.log("\n🔄 Parsing JSON...");
    let payload: any;

    try {
      payload = JSON.parse(rawBody);
      console.log("✅ JSON parsed successfully!");
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return res.status(400).json({ error: "Invalid JSON" });
    }

    // Log product data
    console.log("\n=== PRODUCT DATA ===");
    console.log("Product ID:", payload.id);
    console.log("Title:", payload.title);
    console.log("Vendor:", payload.vendor);
    console.log("Product Type:", payload.product_type);
    console.log("Tags:", payload.tags);
    console.log("Status:", payload.status);

    if (payload.images) {
      console.log("Images:", payload.images.length);
    }

    if (payload.variants) {
      console.log("Variants:", payload.variants.length);
    }

    // Verify HMAC (optional for testing, required for production)
    const hmacHeader = req.headers["x-shopify-hmac-sha256"];
    if (hmacHeader && process.env.SHOPIFY_WEBHOOK_SECRET) {
      console.log("\n🔐 Verifying HMAC...");
      const generatedHash = crypto
        .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(rawBody, "utf8")
        .digest("base64");

      if (generatedHash !== hmacHeader) {
        console.error("❌ HMAC verification failed!");
        return res.status(401).json({ error: "Invalid signature" });
      }
      console.log("✅ HMAC verified!");
    } else {
      console.warn("⚠️  HMAC verification skipped (no secret configured)");
    }

    // TODO: Process the webhook
    // - Extract gender from title
    // - Create/find brand from vendor
    // - Map collections
    // - Update Sanity

    console.log("\n" + "=".repeat(80));
    console.log("✅ WEBHOOK PROCESSED SUCCESSFULLY");
    console.log("=".repeat(80));

    return res.status(200).json({
      success: true,
      received: {
        productId: payload.id,
        title: payload.title,
        vendor: payload.vendor,
        productType: payload.product_type,
      },
      // Return the full payload for debugging
      fullPayload: payload,
      headers: {
        topic: req.headers["x-shopify-topic"],
        shopDomain: req.headers["x-shopify-shop-domain"],
        hmacPresent: !!req.headers["x-shopify-hmac-sha256"],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ ERROR:", error);
    console.error("=".repeat(80));

    return res.status(500).json({
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
