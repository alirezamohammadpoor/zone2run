"use client";

import React, { useState } from "react";

interface ProductDescriptionProps {
  description: string;
  alwaysExpanded?: boolean;
}

function ProductDescription({
  description,
  alwaysExpanded = false,
}: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Strip HTML tags and convert to clean text
  const cleanDescription = description
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags
    .trim();

  // Truncate to approximately 150 characters or 3 lines
  const truncateLength = 100;
  const shouldTruncate =
    !alwaysExpanded && cleanDescription.length > truncateLength;
  const truncatedText = shouldTruncate
    ? cleanDescription.slice(0, truncateLength).trim() + "..."
    : cleanDescription;

  const displayText =
    alwaysExpanded || isExpanded ? cleanDescription : truncatedText;

  return (
    <div>
      <div className="mt-4 mb-4 ml-2">
        <p className="font-medium text-sm mb-2">Product Description</p>
        <p className="text-sm text-black whitespace-pre-line">{displayText}</p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-900 underline mt-2"
          >
            {isExpanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductDescription;
