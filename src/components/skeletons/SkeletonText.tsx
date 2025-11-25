import React from "react";
import { BaseSkeleton } from "./BaseSkeleton";

interface SkeletonTextProps {
  width?: "full" | "3/4" | "1/2" | "1/3" | "1/4";
  size?: "sm" | "base" | "lg";
  className?: string;
}

const widthClasses = {
  full: "w-full",
  "3/4": "w-3/4",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
  "1/4": "w-1/4",
};

const sizeClasses = {
  sm: "h-3",
  base: "h-4",
  lg: "h-5",
};

export function SkeletonText({
  width = "full",
  size = "base",
  className = "",
}: SkeletonTextProps) {
  return (
    <BaseSkeleton
      className={`${widthClasses[width]} ${sizeClasses[size]} ${className}`}
    />
  );
}
