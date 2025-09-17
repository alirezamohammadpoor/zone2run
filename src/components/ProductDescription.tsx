import React from "react";
import { getProductDescription } from "@/sanity/lib/getData";

async function ProductDescription({ productId }: { productId: string }) {
  const productDescription = await getProductDescription(productId);
  return (
    <div>
      <div className="mt-12 mb-12 ml-2">
        <p className="font-medium text-sm uppercase mb-2">
          Product Description
        </p>
        <p className="text-sm text-black">{productDescription}</p>
      </div>
    </div>
  );
}

export default ProductDescription;
