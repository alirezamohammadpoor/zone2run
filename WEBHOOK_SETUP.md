# Shopify Webhook Setup

## 🎯 Overview

This webhook automatically syncs products and images from Shopify to Sanity, providing optimal performance by storing images locally in Sanity.

## 🔧 Features

- ✅ **Product sync** - Creates/updates/deletes products in Sanity
- ✅ **Image sync** - Downloads and optimizes images from Shopify to Sanity
- ✅ **Gender detection** - Automatically detects gender from title, tags, and product type
- ✅ **Brand management** - Creates brand references automatically
- ✅ **Category mapping** - Maps Shopify product types to Sanity categories
- ✅ **Image optimization** - Optimizes images for web performance

## 📋 Environment Variables Required

```bash
# Sanity Configuration
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token

# Shopify Configuration
SHOPIFY_STORE=your_store_name
SHOPIFY_ADMIN_API_TOKEN=your_shopify_token
```

## 🚀 Webhook Endpoints

### Main Product Webhook

```
POST /api/shopify-product-webhook
```

Handles: `products/create`, `products/update`, `products/delete`

### Test Webhook

```
GET /api/test-webhook
POST /api/test-webhook
```

For testing webhook connectivity

## 🔗 Shopify Webhook Configuration

In your Shopify Admin, set up these webhooks:

1. **Products Create/Update**
   - URL: `https://your-domain.com/api/shopify-product-webhook`
   - Events: `products/create`, `products/update`
   - Format: JSON

2. **Products Delete**
   - URL: `https://your-domain.com/api/shopify-product-webhook`
   - Events: `products/delete`
   - Format: JSON

## 🖼️ Image Processing

The webhook automatically:

- Downloads images from Shopify CDN
- Optimizes them (WebP format, 1200px max, 85% quality)
- Uploads to Sanity with proper metadata
- Creates references in product documents

## 🎨 Gender Detection Logic

The webhook detects gender by checking:

1. **Product title** - "Men's", "Women's", "M's", "W's"
2. **Product tags** - Gender indicators in tags
3. **Product type** - Gender in product type field

## 📊 Performance Benefits

- ⚡ **Faster page loads** - Images served from Sanity CDN
- 🚀 **Better SEO** - Images on your domain
- 💰 **Cost effective** - No Shopify API rate limits
- 🔧 **Full control** - Custom image transformations

## 🧪 Testing

1. **Test webhook connectivity:**

   ```bash
   curl https://your-domain.com/api/test-webhook
   ```

2. **Test with sample data:**
   ```bash
   curl -X POST https://your-domain.com/api/test-webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

## 🔍 Monitoring

Check webhook logs in your deployment platform or add logging to track:

- Successful product syncs
- Image download/upload status
- Error handling and retries

## 🚨 Error Handling

The webhook includes comprehensive error handling for:

- Invalid image URLs
- Network timeouts
- Sanity API limits
- Shopify API errors
- Missing environment variables

## 📈 Next Steps

1. Set up the webhook endpoints in Shopify Admin
2. Test with a few products
3. Monitor the sync process
4. Verify images are properly stored in Sanity
5. Check product data accuracy in Sanity Studio
