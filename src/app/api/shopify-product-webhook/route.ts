/**
 * Shopify Webhook Handler
 *
 * Thin orchestrator that routes webhook events to appropriate processors.
 * Business logic is contained in modular processors.
 *
 * @module api/shopify-product-webhook
 */

import {
  logger,
  isWebhookDuplicate,
  markWebhookProcessed,
  processProductWebhook,
  processCollectionWebhook,
  type ShopifyProductPayload,
  type ShopifyCollectionPayload,
  type ProcessingResult,
} from "@/lib/webhook";

export const runtime = "nodejs";

/**
 * Parse webhook headers
 */
function parseWebhookHeaders(request: Request) {
  return {
    topic: request.headers.get("x-shopify-topic"),
    webhookId: request.headers.get("x-shopify-webhook-id"),
    eventId: request.headers.get("x-shopify-event-id"),
    shopDomain: request.headers.get("x-shopify-shop-domain"),
    hmac: request.headers.get("x-shopify-hmac-sha256"),
    userAgent: request.headers.get("user-agent"),
  };
}

/**
 * Create a JSON response
 */
function jsonResponse(data: ProcessingResult, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Main webhook handler
 */
export async function POST(request: Request): Promise<Response> {
  const timestamp = new Date().toISOString();

  try {
    // Parse headers
    const headers = parseWebhookHeaders(request);
    const isRealShopify = headers.userAgent === "Shopify-Captain-Hook";

    logger.webhookReceived({
      topic: headers.topic,
      webhookId: headers.webhookId,
      eventId: headers.eventId,
      isRealShopify,
    });

    // Check for duplicate webhook
    if (headers.webhookId && headers.eventId) {
      if (isWebhookDuplicate(headers.webhookId, headers.eventId)) {
        logger.skipped("Duplicate webhook", {
          webhookId: headers.webhookId,
          eventId: headers.eventId,
        });
        return jsonResponse({
          success: true,
          message: "Duplicate webhook - already processed",
          timestamp,
        });
      }
      markWebhookProcessed(headers.webhookId, headers.eventId);
    }

    // Parse request body
    const text = await request.text();

    if (!text || text.length === 0) {
      logger.error("Empty body received");
      return jsonResponse(
        { success: false, message: "Empty body", timestamp },
        400
      );
    }

    let payload: ShopifyProductPayload | ShopifyCollectionPayload;
    try {
      payload = JSON.parse(text);
    } catch (parseError) {
      logger.error("JSON parse error", {}, parseError as Error);
      return jsonResponse(
        { success: false, message: "Invalid JSON", timestamp },
        400
      );
    }

    // Route to appropriate processor
    const processorOptions = {
      webhookId: headers.webhookId,
      eventId: headers.eventId,
    };

    if (headers.topic?.startsWith("products/")) {
      logger.info("Routing to product processor", {
        topic: headers.topic,
        productId: String((payload as ShopifyProductPayload).id),
      });

      const result = await processProductWebhook(
        headers.topic,
        payload as ShopifyProductPayload,
        processorOptions
      );

      return jsonResponse(result, result.success ? 200 : 500);
    }

    if (headers.topic?.startsWith("collections/")) {
      logger.info("Routing to collection processor", {
        topic: headers.topic,
        collectionId: String((payload as ShopifyCollectionPayload).id),
      });

      const result = await processCollectionWebhook(
        headers.topic,
        payload as ShopifyCollectionPayload,
        processorOptions
      );

      return jsonResponse(result, result.success ? 200 : 500);
    }

    // Unknown topic
    logger.warn("Unknown webhook topic", { topic: headers.topic ?? undefined });
    return jsonResponse(
      {
        success: false,
        message: "Unknown webhook topic",
        timestamp,
      },
      400
    );
  } catch (error) {
    logger.error("Critical webhook error", {}, error as Error);

    return jsonResponse(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      },
      500
    );
  }
}
