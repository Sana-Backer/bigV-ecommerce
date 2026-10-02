"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

/**
 * ProductCard Component
 * Perfectly matches the design with specific background colors, 
 * padding, typography from the home page components.
 */
export default function ProductCard({
  product,
  isLoading = false,
  onAddToCart,
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col w-full aspect-[4/5] rounded-[16px] bg-[#F0D4D0]/50 p-4 animate-pulse border border-black/[0.04]">
        <div className="flex justify-between items-start">
          <div className="w-24 h-6 bg-white/50 rounded-full" />
          <div className="w-8 h-8 bg-white/50 rounded-full" />
        </div>
        <div className="mt-auto flex justify-between items-center pt-4">
          <div className="w-24 h-6 bg-black/10 rounded-md" />
          <div className="w-16 h-6 bg-black/10 rounded-md" />
        </div>
      </div>
    );
  }

  const { name, price, image, bgColor } = product;
  const cardBg = bgColor || "bg-[#F0D4D0]";

  return (
    <Link 
      href={`/products/${product.id || 1}`}
      className={`group relative flex flex-col w-full aspect-[4/5] rounded-[16px] ${cardBg} p-4 md:p-5 overflow-hidden transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer border border-black/[0.04]`}
    >
      
      {/* Top Header - Badge and Icon */}
      <div className="flex justify-between items-start z-10 relative">
        <span className="text-[8px] sm:text-[11px] bg-[#ffffff] px-2 py-[4px] rounded-full text-[#2d3150] tracking-wide">
          PURE BRILLIANCE
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onAddToCart && onAddToCart(product);
          }}
          className="bg-white p-2 rounded-full text-[#2d3150] hover:scale-105 active:scale-95 transition-transform duration-300"
        >
          <ShoppingBag size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Centered Product Image */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      </div>

      {/* Bottom Footer - Title and Price */}
      <div className="flex justify-between items-end z-10 relative mt-auto pt-4">
        <h3 className="text-[14px] md:text-base font-medium text-[#130D40] tracking-wide leading-none">
          {name}
        </h3>
        <span className="text-[14px] md:text-base font-medium text-[#130D40] tracking-wide leading-none">
          {price}
        </span>
      </div>
    </Link>
  );
}
