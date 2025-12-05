// src/components/ProductCardSkeleton.tsx
import React from "react";

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl border-2 border-green-200 overflow-hidden animate-pulse flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square bg-gray-200"></div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow text-center">
        {/* Category badge */}
        <div className="h-4 w-16 bg-gray-300 rounded mx-auto"></div>

        {/* Product name */}
        <div className="h-5 w-3/4 bg-gray-300 rounded mx-auto mt-1"></div>

        {/* Price */}
        <div className="h-4 w-1/3 bg-gray-300 rounded mx-auto mt-1"></div>

        {/* Select & button */}
        <div className="flex flex-col gap-2 mt-3">
          <div className="h-8 w-full bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
