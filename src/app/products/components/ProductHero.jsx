"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getActiveBannersApi } from "@/services/bannersApi";

const ProductHero = ({ category = "" }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryBanner = async () => {
      setLoading(true);
      try {
        // Format category slug if a string is provided (e.g. "beauty care" -> "beauty-care")
        const categorySlug = category
          ? category.trim().toLowerCase().replace(/\s+/g, "-")
          : "";

        const res = await getActiveBannersApi({
          placement: "shop_category",
          category: categorySlug,
        });

        if (isMounted && res && res.status === 200) {
          const list = res.data?.results || res.data?.data || res.data || [];
          if (Array.isArray(list) && list.length > 0) {
            // Find active banner for this placement
            setBanner(list[0]);
          } else {
            setBanner(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch shop category banner:", err);
        if (isMounted) setBanner(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryBanner();

    return () => {
      isMounted = false;
    };
  }, [category]);

  return (
    <section className="sticky top-0 h-[380px] md:h-[450px] w-full overflow-hidden bg-slate-900 z-0">
      <div className="relative w-full h-full">
        {banner && banner.image ? (
          <>
            {/* Desktop Banner Image */}
            <Image
              src={banner.image}
              alt={banner.title || "Category Banner"}
              fill
              priority
              className={`object-cover transition-opacity duration-700 ${
                banner.mobile_image ? "hidden md:block" : "block"
              }`}
            />

            {/* Optional Alternate Mobile Image */}
            {banner.mobile_image && (
              <Image
                src={banner.mobile_image}
                alt={banner.title || "Category Banner Mobile"}
                fill
                priority
                className="object-cover md:hidden transition-opacity duration-700"
              />
            )}
          </>
        ) : (
          /* Default Fallback Hero Image */
          <Image
            src="/product-hero.png"
            alt="Product Hero"
            fill
            priority
            className="object-cover"
          />
        )}

        {/* Dark Vignette Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/30" />

        {/* Dynamic Title, Subtitle, and CTA Button (if configured) */}
        {banner && (banner.title || banner.subtitle || (banner.link_url && banner.cta_text)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6 text-center animate-in fade-in duration-500">
            {banner.title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg mb-3 max-w-3xl">
                {banner.title}
              </h1>
            )}

            {banner.subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl font-medium drop-shadow mb-6 line-clamp-2">
                {banner.subtitle}
              </p>
            )}

            {banner.link_url && banner.cta_text && (
              <Link
                href={banner.link_url}
                className="bg-white text-[#2C3B5E] hover:bg-[#2C3B5E] hover:text-white px-7 py-2.5 rounded-full font-bold transition-all duration-300 text-xs sm:text-sm tracking-wide uppercase shadow-xl hover:shadow-2xl hover:scale-105"
              >
                {banner.cta_text}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductHero;
