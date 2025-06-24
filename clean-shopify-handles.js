const fs = require('fs');
const path = require('path');

// Brand prefixes to remove
const brandPrefixes = [
  'bandit-running-',
  'unna-',
  'kuta-distance-lab-'
];

function cleanShopifyHandle(handle) {
  if (!handle) return handle;
  
  let cleanedHandle = handle;
  
  // Remove brand prefixes
  for (const prefix of brandPrefixes) {
    if (cleanedHandle.startsWith(prefix)) {
      cleanedHandle = cleanedHandle.substring(prefix.length);
      break; // Only remove one prefix
    }
  }
  
  return cleanedHandle;
}

function processNDJSONFile(inputPath, outputPath) {
  try {
    // Read the input file
    const content = fs.readFileSync(inputPath, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`Processing ${lines.length} products...`);
    
    const processedLines = lines.map((line, index) => {
      try {
        const product = JSON.parse(line);
        
        // Clean the shopify handle
        if (product.shopifyHandle) {
          const originalHandle = product.shopifyHandle;
          product.shopifyHandle = cleanShopifyHandle(originalHandle);
          
          if (originalHandle !== product.shopifyHandle) {
            console.log(`Line ${index + 1}: "${originalHandle}" → "${product.shopifyHandle}"`);
          }
        }
        
        return JSON.stringify(product);
      } catch (error) {
        console.error(`Error processing line ${index + 1}:`, error.message);
        return line; // Return original line if parsing fails
      }
    });
    
    // Write the output file
    const outputContent = processedLines.join('\n');
    fs.writeFileSync(outputPath, outputContent);
    
    console.log(`\n✅ Successfully processed ${lines.length} products`);
    console.log(`📁 Output saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error processing file:', error.message);
  }
}

// File paths
const inputFile = '/Users/alirezamohammadpoor/Downloads/sanity_products_final_cleaned_ids_and_handles.ndjson';
const outputFile = '/Users/alirezamohammadpoor/Downloads/sanity_products_cleaned_handles.ndjson';

// Process the file
console.log('🧹 Cleaning Shopify handles...\n');
processNDJSONFile(inputFile, outputFile); 