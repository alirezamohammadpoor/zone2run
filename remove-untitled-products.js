const { createClient } = require('@sanity/client');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.SANITY_STUDIO_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-12',
  useCdn: false,
});

async function removeUntitledProducts() {
  try {
    console.log('🔍 Searching for products with "Untitled" in their title...\n');
    
    // Find all products with "Untitled" in the title
    const untitledProducts = await client.fetch(`
      *[_type == "product" && (title match "*Untitled*" || title == "Untitled Product")] {
        _id,
        title,
        shopifyHandle,
        shopifyId
      }
    `);
    
    if (untitledProducts.length === 0) {
      console.log('✅ No untitled products found!');
      return;
    }
    
    console.log(`📋 Found ${untitledProducts.length} untitled products:`);
    untitledProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (ID: ${product._id})`);
      console.log(`   Shopify Handle: ${product.shopifyHandle}`);
      console.log(`   Shopify ID: ${product.shopifyId}\n`);
    });
    
    // Ask for confirmation
    console.log('⚠️  WARNING: This will permanently delete these products from your Sanity dataset.');
    console.log('   This action cannot be undone!\n');
    
    // For safety, let's just show what would be deleted first
    console.log('🔒 SAFETY MODE: Products are NOT being deleted.');
    console.log('   To actually delete them, uncomment the deletion code in the script.\n');
    
    // Uncomment the following lines to actually delete the products:
    /*
    console.log('🗑️  Deleting untitled products...\n');
    
    let deletedCount = 0;
    for (const product of untitledProducts) {
      try {
        await client.delete(product._id);
        console.log(`✅ Deleted: ${product.title} (${product._id})`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to delete ${product.title}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Deletion complete!`);
    console.log(`📊 Successfully deleted: ${deletedCount}/${untitledProducts.length} products`);
    */
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if Sanity token is available
if (!process.env.SANITY_TOKEN) {
  console.error('❌ SANITY_TOKEN environment variable is required');
  console.log('Please set your Sanity token:');
  console.log('export SANITY_TOKEN="your-sanity-token"');
  process.exit(1);
}

// Run the script
console.log('🚀 Starting untitled product removal process...\n');
removeUntitledProducts().catch(console.error); 