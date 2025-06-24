const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.SANITY_STUDIO_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN, // You'll need to set this
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-12',
  useCdn: false,
});

// Image priority order
const IMAGE_PRIORITY = ['_back.webp', '_3.webp', '_front.webp'];

// Function to find image files in a product folder
function findProductImages(productFolderPath) {
  const images = [];
  
  try {
    const files = fs.readdirSync(productFolderPath);
    
    // Look for images with priority suffixes
    for (const priority of IMAGE_PRIORITY) {
      const imageFile = files.find(file => file.endsWith(priority));
      if (imageFile) {
        images.push({
          path: path.join(productFolderPath, imageFile),
          priority: IMAGE_PRIORITY.indexOf(priority),
          filename: imageFile
        });
      }
    }
    
    // Sort by priority (lower index = higher priority)
    images.sort((a, b) => a.priority - b.priority);
    
  } catch (error) {
    console.error(`Error reading folder ${productFolderPath}:`, error.message);
  }
  
  return images;
}

// Function to upload image to Sanity
async function uploadImageToSanity(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(imagePath)
    });
    return asset._id;
  } catch (error) {
    console.error(`Error uploading image ${imagePath}:`, error.message);
    return null;
  }
}

// Function to normalize product title for matching
function normalizeTitle(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Function to find matching product in Sanity
async function findMatchingProduct(productTitle) {
  try {
    const normalizedTitle = normalizeTitle(productTitle);
    
    // Get all products from Sanity
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        shopifyHandle
      }
    `);
    
    // Find best match
    for (const product of products) {
      const normalizedProductTitle = normalizeTitle(product.title);
      
      // Exact match
      if (normalizedProductTitle === normalizedTitle) {
        return product;
      }
      
      // Partial match (contains)
      if (normalizedProductTitle.includes(normalizedTitle) || 
          normalizedTitle.includes(normalizedProductTitle)) {
        return product;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding matching product:', error.message);
    return null;
  }
}

// Function to update product with images
async function updateProductWithImages(productId, mainImageId, galleryImageIds) {
  try {
    const updateData = {};
    
    if (mainImageId) {
      updateData.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: mainImageId
        },
        alt: 'Product image'
      };
    }
    
    if (galleryImageIds.length > 0) {
      updateData.gallery = galleryImageIds.map(imageId => ({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageId
        },
        alt: 'Product gallery image'
      }));
    }
    
    await client
      .patch(productId)
      .set(updateData)
      .commit();
      
    console.log(`✅ Updated product ${productId} with images`);
    
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error.message);
  }
}

// Main function to process all product folders
async function processProductImages() {
  const publicDir = path.join(__dirname, 'public');
  const brandFolders = [
    'bandit_batch_1_webp',
    'bandit_batch_2_webp', 
    'bandit_batch_3_webp',
    'bandit_batch_4_webp',
    'bandit_batch_5_webp',
    'bandit_batch_1_webp 2',
    'bandit_batch_2_webp 2', 
    'bandit_batch_3_webp 2',
    'bandit_batch_4_webp 2',
    'bandit_batch_5_webp 2',
    'unna_full_webp',
    'unna_full_webp 2',
    'SOAR_Running_Images',
    'SOAR_Running_Images 2',
    'kuta_full_webp',
    'kuta_full_webp 2'
  ];
  
  let processedCount = 0;
  let successCount = 0;
  
  for (const brandFolder of brandFolders) {
    const brandPath = path.join(publicDir, brandFolder);
    
    if (!fs.existsSync(brandPath)) {
      console.log(`⚠️  Brand folder not found: ${brandFolder}`);
      continue;
    }
    
    console.log(`\n📁 Processing brand: ${brandFolder}`);
    
    try {
      const productFolders = fs.readdirSync(brandPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const productFolder of productFolders) {
        processedCount++;
        const productPath = path.join(brandPath, productFolder);
        
        console.log(`\n🔄 Processing: ${productFolder}`);
        
        // Find images in the product folder
        const images = findProductImages(productPath);
        
        if (images.length === 0) {
          console.log(`⚠️  No images found in ${productFolder}`);
          continue;
        }
        
        console.log(`📸 Found ${images.length} images:`, images.map(img => img.filename).join(', '));
        
        // Find matching product in Sanity
        const product = await findMatchingProduct(productFolder);
        
        if (!product) {
          console.log(`❌ No matching product found for: ${productFolder}`);
          continue;
        }
        
        console.log(`✅ Found matching product: ${product.title} (${product._id})`);
        
        // Upload images to Sanity
        const uploadedImageIds = [];
        for (const image of images) {
          const imageId = await uploadImageToSanity(image.path);
          if (imageId) {
            uploadedImageIds.push(imageId);
            console.log(`📤 Uploaded: ${image.filename} → ${imageId}`);
          }
        }
        
        if (uploadedImageIds.length > 0) {
          // Update product with images
          const mainImageId = uploadedImageIds[0]; // First image (highest priority) becomes main
          const galleryImageIds = uploadedImageIds.slice(1); // Rest go to gallery
          
          await updateProductWithImages(product._id, mainImageId, galleryImageIds);
          successCount++;
        }
      }
      
    } catch (error) {
      console.error(`Error processing brand folder ${brandFolder}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Processing complete!`);
  console.log(`📊 Processed: ${processedCount} products`);
  console.log(`✅ Successfully updated: ${successCount} products`);
}

// Check if Sanity token is available
if (!process.env.SANITY_TOKEN) {
  console.error('❌ SANITY_TOKEN environment variable is required');
  console.log('Please set your Sanity token:');
  console.log('export SANITY_TOKEN="your-sanity-token"');
  process.exit(1);
}

// Run the script
console.log('🚀 Starting product image upload process...\n');
processProductImages().catch(console.error); 