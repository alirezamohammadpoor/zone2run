import React from "react";

interface BaseSkeletonProps {
  className?: string;
}

export function BaseSkeleton({ className = "" }: BaseSkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}
