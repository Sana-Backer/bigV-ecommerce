"use client";

import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

const getCategoryTitle = (category) => {
  switch (category?.toLowerCase()) {
    case "beauty care":
      return "Beauty";
    case "kitchen essential":
      return "Kitchen";
    case "powders":
      return "Powder";
    default:
      return "Other";
  }
};

const getCategoryDescription = (category) => {
  return "STAY GLOWING AND HEALTHY WITHOUT HAVING TO THINK ABOUT IT.";
};

const getArrowBgColor = (category) => {
  switch (category?.toLowerCase()) {
    case "beauty care":
      return "bg-[#F0D4D0]/60 hover:bg-[#F0D4D0]";
    case "kitchen essential":
      return "bg-[#E6DCCF]/60 hover:bg-[#E6DCCF]";
    case "powders":
      return "bg-[#EAE8E4] hover:bg-[#dcd9d3]";
    default:
      return "bg-[#EAE8E4] hover:bg-[#dcd9d3]";
  }
};

/**
 * ProductGrid Component
 * Renders products grouped by category, matching the specific Figma section layout.
 */
export default function ProductGrid({
  products = [],
  isLoading = false,
  onAddToCart,
}) {
  const scrollRefs = useRef({});

  const scrollLeft = (category) => {};
  const scrollRight = (category) => {};

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-12 pb-1">
        <div className="w-full">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="w-32 h-10 bg-black/5 rounded animate-pulse mb-2" />
              <div className="w-24 h-8 bg-black/5 rounded animate-pulse" />
            </div>
            <div className="flex gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductCard key={`skeleton-${index}`} isLoading={true} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-gray-300 text-gray-500">
        <p className="text-lg font-medium">No products found.</p>
      </div>
    );
  }

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  // Maintain the order of categories as they appear in the original list if possible
  const categoryOrder = ["featured", "beauty care", "kitchen essential", "powders", "other"];
  const sortedCategories = Object.keys(groupedProducts).sort(
    (a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      // If a category isn't in the list, put it at the end
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
  );

  return (
    <div className="w-full flex flex-col gap-6 pb-6">
      {sortedCategories.map((category) => (
        <div key={category} className="w-full flex flex-col gap-[26px]">
          {/* Section Header */}
          {category === 'featured' ? (
            <div className="relative flex items-center justify-center w-full px-4 md:px-0 pt-6 pb-2">
              <h2 className="text-[#2d3150] font-yellowtail text-5xl md:text-[4rem] leading-none text-center">
                featured
              </h2>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end px-4 md:px-0 gap-6 md:gap-0">
              <div>
                <h2 className="text-[#393F59] text-4xl md:text-[2.75rem] leading-none font-DM_Serif_Display">
                  {getCategoryTitle(category)}
                </h2>
                <p className="text-[#2d3150] font-yellowtail text-3xl md:text-[2.25rem] leading-none mt-1 ml-1">
                  Products
                </p>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div 
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full"
          >
            {groupedProducts[category].map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {/* Section Footer Description */}
          {category !== 'featured' && (
            <p className="text-[#767676] text-[10px] md:text-xs uppercase tracking-[0.15em] max-w-sm leading-relaxed px-4 md:px-0">
              {getCategoryDescription(category)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
