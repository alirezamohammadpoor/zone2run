import React from "react";

function ProductDescription({ description }: { description: string }) {
  // Strip HTML tags and convert to clean text
  const cleanDescription = description
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags
    .trim();

  return (
    <div>
      <div className="mt-12 mb-12 ml-2">
        <p className="font-medium text-sm mb-2">Product Description</p>
        <p className="text-sm w-[90vw] text-black whitespace-pre-line">
          {cleanDescription}
        </p>
      </div>
    </div>
  );
}

export default ProductDescription;
