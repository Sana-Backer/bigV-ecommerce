"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "../Navbar";
import { getActiveBannersApi } from "@/services/bannersApi";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await getActiveBannersApi();
        if (res.status === 200) {
          const fetchedBanners = res.data.results || res.data.data || res.data;
          setBanners(Array.isArray(fetchedBanners) ? fetchedBanners.filter(b => b.placement === "home_hero") : []);
        }
      } catch (err) {
        console.error("Failed to fetch banners", err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden group">
        {/* Navbar */}
        <Navbar />

        {/* Hero Content */}
        <div className="relative w-full h-full">
          {banners.length > 0 ? (
            <>
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10"
                  }`}
                >
                  {/* Desktop Image */}
                  <Image
                    src={banner.image}
                    alt={banner.title || "Banner"}
                    fill
                    priority={index === 0}
                    className={`object-cover ${banner.mobile_image ? "hidden md:block" : ""}`}
                  />
                  {/* Mobile Image (if available) */}
                  {banner.mobile_image && (
                    <Image
                      src={banner.mobile_image}
                      alt={banner.title || "Banner"}
                      fill
                      priority={index === 0}
                      className="object-cover md:hidden"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Banner Text (if any) */}
                  {(banner.title || banner.subtitle) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-4 text-center">
                      {banner.title && (
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg">
                          {banner.title}
                        </h1>
                      )}
                      {banner.subtitle && (
                        <p className="text-lg md:text-xl max-w-2xl font-medium drop-shadow-md mb-8">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.link_url && banner.cta_text && (
                        <a
                          href={banner.link_url}
                          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-colors uppercase tracking-wider text-sm"
                        >
                          {banner.cta_text}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Slider Controls */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 transition-colors z-20 opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 transition-colors z-20 opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          i === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Fallback Image */}
              <Image
                src="/heroo.png"
                alt="Hero"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Hero;