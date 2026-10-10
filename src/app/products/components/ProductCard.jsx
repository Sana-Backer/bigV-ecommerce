"use client";

import React, { useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";
import { addToWishlistApi } from "@/services/wishlistApi";
import toast from "react-hot-toast";
import AuthModal from "@/components/AuthModal";

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

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;
    try {
      const res = await addToWishlistApi({ product_id: product.id });

      if (res?.response?.status === 401 || res?.response?.status === 403) {
        setShowAuthModal(true);
        return;
      }

      if (res.status === 201 || res.status === 200) {
        toast.success(`Added ${product?.name || "Product"} to your wishlist!`, {
          style: {
            background: "#2d3150",
            color: "#fff",
            borderRadius: "12px",
          },
        });
      } else {
        const errorData = res?.response?.data || res?.data;
        if (errorData?.message === "Authentication credentials were not provided.") {
          setShowAuthModal(true);
        } else {
          const errorMsg = errorData?.message || (typeof errorData === 'string' ? errorData : "Failed to add to wishlist");
          toast.error(errorMsg, {
            style: {
              background: "#2d3150",
              color: "#fff",
              borderRadius: "12px",
            }
          });
        }
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      setShowAuthModal(true);
    }
  };


  const { name, base_price, effective_price, price, image, bgColor } = product;
  const cardBg = bgColor || "bg-[#F0D4D0]";
  const displayPrice = effective_price || price || base_price;

  return (
    <Link
      href={`/products/${product.id || 1}`}
      className={`group relative flex flex-col w-full aspect-[4/5] rounded-[16px] ${cardBg} p-4 md:p-5 overflow-hidden transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer border border-black/[0.04]`}
    >

      {/* Top Header - Badge and Icon */}
      <div className="flex justify-between items-start z-10 relative">
        {product.is_featured ? (
          <span className="text-[8px] sm:text-[11px] bg-[#ffffff] px-2 py-[4px] rounded-full text-[#2d3150] tracking-wide">
            FEATURED
          </span>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <button
            onClick={handleAddToWishlist}
            className="bg-white p-2 rounded-full text-[#2d3150] hover:text-rose-500 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Heart size={14} strokeWidth={1.5} />
          </button>
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
      </div>

      {/* Centered Product Image */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          // mix-blend-multiply -------------------to remove bcknd color
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : null}
      </div>

      {/* Bottom Footer - Title and Price */}
      <div className="flex justify-between items-end z-10 relative mt-auto pt-4 gap-2">
        <h3 className="text-[14px] md:text-base font-medium text-[#130D40] tracking-wide leading-none truncate max-w-[65%]">
          {name}
        </h3>
        <div className="flex flex-col items-end shrink-0">
          {base_price && base_price !== displayPrice && (
            <span className="text-[10px] md:text-[11px] text-[#130D40]/50 line-through tracking-wide leading-none mb-1">
              ₹{base_price}
            </span>
          )}
          <span className="text-[14px] md:text-base font-medium text-[#130D40] tracking-wide leading-none">
            {displayPrice ? `₹${displayPrice}` : ''}
          </span>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        redirectPath={`/products`} 
      />
    </Link>
  );
}
