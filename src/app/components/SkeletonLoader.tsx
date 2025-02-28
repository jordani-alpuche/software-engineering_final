// components/SkeletonLoader.tsx
import React from "react";

export const SkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex space-x-4">
        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
      </div>
      {/* Repeat for each row */}
    </div>
  );
};
