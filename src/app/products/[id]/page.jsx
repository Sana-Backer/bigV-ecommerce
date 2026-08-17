"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Truck,
  Heart,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";
import { getProductDetailApi } from "@/services/productsApi";
import { addToCartApi } from "@/services/cartApi";
import { addToWishlistApi } from "@/services/wishlistApi";

gsap.registerPlugin(ScrollTrigger);

// Mock Shades Data
const SHADES = [
  { name: "ROSE NUDE", color: "#C18386", price: "₹899", image: "/p-details-hero.png", bg: "bg-[#F0D4D0]" },
  { name: "CRIMSON RED", color: "#8B2635", price: "₹949", image: "/p-details-hero.png", bg: "bg-[#E6C2C2]" },
  { name: "PEACH PINK", color: "#DDA15E", price: "₹899", image: "/p-details-hero.png", bg: "bg-[#F3E1D3]" },
  { name: "NAKED PLUM", color: "#6F2D4C", price: "₹949", image: "/p-details-hero.png", bg: "bg-[#D8B4D4]" },
];

// Carousel featured products
const FEATURED_PRODUCTS = [
  { name: "Face Mist", price: "₹399.00", image: "/product1.png", tag: "PURE BRILLIANCE", bg: "bg-[#F0D4D0]" },
  { name: "Lipstick", price: "₹399.00", image: "/product2.png", tag: "PURE BRILLIANCE", bg: "bg-[#F0D4D0]" },
  { name: "Mascara", price: "₹399.00", image: "/product2.png", tag: "PURE BRILLIANCE", bg: "bg-[#F0D4D0]" },
  { name: "Face Mist", price: "₹399.00", image: "/product1.png", tag: "PURE BRILLIANCE", bg: "bg-[#F0D4D0]" },
  { name: "Lipstick", price: "₹399.00", image: "/product2.png", tag: "PURE BRILLIANCE", bg: "bg-[#F0D4D0]" },
];

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const productId = params?.id || "1";

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedShade, setSelectedShade] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("about");
  const [cartNotification, setCartNotification] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);

  // Refs
  const pageRef = useRef(null);
  const mainImageRef = useRef(null);
  const midSectionRef = useRef(null);
  const tabsSectionRef = useRef(null);
  const featuredSectionRef = useRef(null);
  const carouselRef = useRef(null);

  // Shade changes
  const handleShadeChange = (shade) => {
    setSelectedShade(shade);
    if (shade?.images && shade.images.length > 0) {
      setActiveImage(shade.images[0].image);
    } else if (product?.images && product.images.length > 0) {
      setActiveImage(product.images[0].image);
    }

    // Quick micro-animation for the image swap
    gsap.fromTo(mainImageRef.current,
      { scale: 0.9, opacity: 0.5, rotate: -3 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "power2.out" }
    );
  };

  // Quantity handlers
  const adjustQuantity = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const payload = {
        product_id: product.id,
        quantity: quantity,
      };
      if (selectedShade?.id) {
        payload.variant_id = selectedShade.id;
      }

      const res = await addToCartApi(payload);
      if (res.status === 201 || res.status === 200) {
        setCartNotification(`Added ${quantity} x ${product?.name || "Product"} (${selectedShade?.name || selectedShade?.attributes?.size || ''}) to your bag!`);
        setTimeout(() => setCartNotification(""), 3500);
        window.dispatchEvent(new Event("cartUpdated"));
        window.dispatchEvent(new Event("openCart"));
      } else {
        alert("Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Something went wrong while adding to cart");
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = async () => {
    if (!product) return;
    try {
      const res = await addToWishlistApi({ product_id: product.id });
      if (res.status === 201 || res.status === 200) {
        setCartNotification(`Added ${product?.name || "Product"} to your wishlist!`);
        setTimeout(() => setCartNotification(""), 3500);
      } else {
        alert("Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Please log in to add items to your wishlist.");
    }
  };

  // Toggle FAQ Accordion
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductDetailApi(productId);
        if (res.status === 200 && res.data?.status === "success") {
          const productData = res.data.data;
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setActiveImage(productData.images[0].image);
          }
          if (productData.variants && productData.variants.length > 0) {
            const defaultVar = productData.variants.find(v => v.is_default) || productData.variants[0];
            setSelectedShade(defaultVar);
          }
          console.log(productData);

        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Hero Animations
      const tl = gsap.timeline();
      tl.fromTo(".hero-section-bg",
        { opacity: 0 },
        { opacity: 1, duration: 1.4, ease: "power4.inOut" }
      )
        .fromTo(".hero-product-img",
          { y: 80, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.2)" },
          "-=0.6"
        )
        .fromTo(".animate-fade-up",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out" },
          "-=0.8"
        );

      // 2. Mid Section Scroll Animations (Smooth Element-Level Scroll Scrub)
      gsap.fromTo(".mid-image-left",
        { opacity: 0, y: 60, x: -40, rotate: -2 },
        {
          opacity: 1, y: 0, x: 0, rotate: 0,
          scrollTrigger: {
            trigger: ".mid-image-left",
            start: "top 98%",
            end: "top 50%",
            scrub: 1,
          }
        }
      );

      gsap.fromTo(".mid-text-main",
        { opacity: 0, y: 70 },
        {
          opacity: 1, y: 0,
          scrollTrigger: {
            trigger: ".mid-text-main",
            start: "top 98%",
            end: "top 55%",
            scrub: 1,
          }
        }
      );

      gsap.fromTo(".mid-column-fade",
        { opacity: 0, y: 80 },
        {
          opacity: 1, y: 0, stagger: 0.1,
          scrollTrigger: {
            trigger: ".mid-column-fade",
            start: "top 98%",
            end: "top 60%",
            scrub: 1,
          }
        }
      );

      gsap.fromTo(".mid-image-right",
        { opacity: 0, y: 90, x: 40, rotate: 2 },
        {
          opacity: 1, y: 0, x: 0, rotate: 0,
          scrollTrigger: {
            trigger: ".mid-image-right",
            start: "top 98%",
            end: "top 50%",
            scrub: 1,
          }
        }
      );

      // 3. Tab Section Animations
      gsap.fromTo(".tabs-header-animate",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: ".tabs-header-animate",
            start: "top 88%",
          }
        }
      );

      gsap.fromTo(".tabs-content-animate",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: {
            trigger: ".tabs-content-animate",
            start: "top 85%",
          }
        }
      );

      // 4. Featured Scroll & Tilt Interaction
      const carousel = carouselRef.current;
      const cards = carousel.querySelectorAll(".featured-card");

      gsap.fromTo(cards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: carousel,
            start: "top 90%",
          }
        }
      );

      // Mouse/Touch Drag Scroll with Tilt (Category Showcase style!)
      let isDown = false;
      let startX;
      let scrollLeft;
      let lastX;

      const onMouseDown = (e) => {
        isDown = true;
        carousel.classList.add("cursor-grabbing");
        startX = e.pageX - carousel.offsetLeft;
        lastX = e.pageX;
        scrollLeft = carousel.scrollLeft;
      };

      const onMouseLeaveOrUp = () => {
        isDown = false;
        carousel.classList.remove("cursor-grabbing");
        gsap.to(cards, {
          rotate: 0, skewX: 0, x: 0, duration: 0.6,
          ease: "back.out(1.5)", overwrite: "auto"
        });
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.8;
        carousel.scrollLeft = scrollLeft - walk;

        const deltaX = e.pageX - lastX;
        lastX = e.pageX;

        let tiltAngle = Math.max(-7, Math.min(7, deltaX * 0.6));
        gsap.to(cards, {
          rotate: -tiltAngle, skewX: -tiltAngle * 0.4,
          duration: 0.4, ease: "power2.out", overwrite: "auto"
        });
      };

      carousel.addEventListener("mousedown", onMouseDown);
      carousel.addEventListener("mouseleave", onMouseLeaveOrUp);
      carousel.addEventListener("mouseup", onMouseLeaveOrUp);
      carousel.addEventListener("mousemove", onMouseMove);

      return () => {
        carousel.removeEventListener("mousedown", onMouseDown);
        carousel.removeEventListener("mouseleave", onMouseLeaveOrUp);
        carousel.removeEventListener("mouseup", onMouseLeaveOrUp);
        carousel.removeEventListener("mousemove", onMouseMove);
      };

    }, pageRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  // Quick helper to scroll featured carousel
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      carouselRef.current.scrollTo({
        left: carouselRef.current.scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <main ref={pageRef} className="bg-[#FFFFFF] text-[#2d3150] min-h-screen overflow-x-hidden selection:bg-[#2d3150] selection:text-white relative">

      {/* Dynamic Navbar */}
      <Navbar theme="light" />

      {/* Floating Add to Cart Toast */}
      {cartNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2d3150] text-[#F0D4DD] py-4 px-6 rounded-xl shadow-[0_20px_50px_rgba(45,49,80,0.25)] flex items-center gap-3 animate-fade-in border border-[#F0D4DD]/20">
          <CheckCircle className="w-5 h-5 text-[#C18386]" />
          <span className="text-sm font-medium tracking-wide">{cartNotification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: PRODUCT HERO (SPLIT LAYOUT) */}
      {/* ========================================================================= */}
      <section className="relative z-0 w-full pt-32 lg:pt-30 pb-0 flex items-start overflow-hidden">
        {/* Asymmetric Pink Background - Stops early on Desktop */}
        <div className={`absolute top-0 left-0 w-full h-full lg:h-[calc(100%-8rem)] -z-10 ${selectedShade?.bg || "bg-[#F0D4D0]"} transition-colors duration-700`} />

        <div className="w-full max-w-[1400px] mx-auto pl-6 pr-6 lg:pl-10 lg:pr-0 relative z-10 flex flex-col lg:flex-row items-start lg:items-stretch justify-between gap-12">

          {/* Left Side: Product Image & Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row justify-start items-start gap-4 lg:gap-8 relative mb-2 lg:mb-0">

            {/* Thumbnail Gallery (Desktop Only) */}
            {product?.images && product.images.length > 0 && (
              <div className="hidden lg:flex flex-col gap-4 w-auto overflow-y-auto no-scrollbar pb-0 max-h-[35rem]">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => {
                      setActiveImage(img.image);
                      gsap.fromTo(mainImageRef.current,
                        { opacity: 0.5, scale: 0.96 },
                        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
                      );
                    }}
                    className={`shrink-0 lg:w-[100px] lg:h-[100px] bg-white border transition-all duration-300 p-2 flex items-center justify-center ${activeImage === img.image
                      ? "border-[#393F59] shadow-sm"
                      : "border-transparent hover:border-gray-200"
                      }`}
                  >
                    <img
                      src={img.image}
                      alt={img.alt_text || `Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image / Mobile Carousel */}
            <div
              ref={mainImageRef}
              className="hero-product-img relative flex-1 w-full lg:w-auto max-w-[35rem] aspect-square flex flex-col lg:items-center justify-center select-none transition-all mb-6 lg:mb-0"
            >
              {/* Desktop Single Image */}
              <div className="hidden lg:flex w-full h-full items-center justify-center">
                <img
                  src={activeImage || product?.images?.[0]?.image || selectedShade?.image || "/placeholder.png"}
                  alt={product?.name || "Product Hero"}
                  draggable={false}
                  className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)]"
                />
              </div>

              {/* Mobile Swipeable Gallery */}
              <div
                className="flex lg:hidden w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab scroll-smooth"
                onScroll={(e) => {
                  const scrollLeft = e.target.scrollLeft;
                  const width = e.target.clientWidth;
                  const index = Math.round(scrollLeft / width);
                  setMobileImageIndex(index);
                }}
                onMouseDown={(e) => {
                  e.currentTarget.dataset.isDown = "true";
                  e.currentTarget.dataset.startX = e.pageX - e.currentTarget.offsetLeft;
                  e.currentTarget.dataset.scrollLeftStart = e.currentTarget.scrollLeft;
                  e.currentTarget.classList.add('cursor-grabbing');
                  e.currentTarget.classList.remove('cursor-grab', 'snap-mandatory', 'scroll-smooth');
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget.dataset.isDown === "true") {
                    e.currentTarget.dataset.isDown = "false";
                    e.currentTarget.classList.remove('cursor-grabbing');
                    e.currentTarget.classList.add('cursor-grab', 'snap-mandatory', 'scroll-smooth');
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.dataset.isDown = "false";
                  e.currentTarget.classList.remove('cursor-grabbing');
                  e.currentTarget.classList.add('cursor-grab', 'snap-mandatory', 'scroll-smooth');
                }}
                onMouseMove={(e) => {
                  if (e.currentTarget.dataset.isDown !== "true") return;
                  e.preventDefault();
                  const x = e.pageX - e.currentTarget.offsetLeft;
                  const startX = parseFloat(e.currentTarget.dataset.startX || "0");
                  const scrollLeftStart = parseFloat(e.currentTarget.dataset.scrollLeftStart || "0");
                  const walk = (x - startX) * 1.5;
                  e.currentTarget.scrollLeft = scrollLeftStart - walk;
                }}
              >
                {product?.images && product.images.length > 0 ? (
                  product.images.map((img, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 snap-center flex items-center justify-center p-4">
                      <img
                        src={img.image}
                        alt={img.alt_text || `Image ${idx + 1}`}
                        draggable={false}
                        className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)]"
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full shrink-0 snap-center flex items-center justify-center p-4">
                    <img
                      src={activeImage || selectedShade?.image || "/placeholder.png"}
                      alt="Product"
                      draggable={false}
                      className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)]"
                    />
                  </div>
                )}
              </div>

              {/* Mobile Dash Indicators */}
              {product?.images && product.images.length > 1 && (
                <div className="flex lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 gap-2">
                  {product.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${mobileImageIndex === idx ? 'w-6 bg-[#2d3150]' : 'w-4 bg-[#2d3150]/30'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Floating Details Card */}
          <div className="w-full lg:w-[45%] bg-[#F2F2F2] rounded-none p-4 sm:p-4 lg:p-8 relative z-20">

            {/* Badge */}
            <div className="animate-fade-up mb-4 flex items-center">
              <div className="w-[162px] h-[28px] rounded-[15px] border-[0.8px] border-[#767676] flex items-center justify-center">
                <span
                  className="text-[#130D40] text-[15px] font-normal uppercase leading-none tracking-normal"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  PURE BRILLIANCE
                </span>
              </div>
            </div>

            {/* Main Title */}
            <h1
              className="animate-fade-up text-4xl md:text-[48px] font-bold uppercase text-[#393F59] mb-3 md:leading-[50px] tracking-normal"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {product?.name || "VELOURA MATTE LIPSTICK"}
            </h1>

            {/* Shade */}
            {/* {selectedShade && (
              <div className="animate-fade-up flex items-center gap-3 mb-6">
                <p className="text-sm font-semibold tracking-[0.15em] text-[#C18386] uppercase">
                  SIZE: {selectedShade?.attributes?.size || selectedShade?.name}
                </p>
              </div>
            )} */}

            {/* Price & Size Pill */}
            <div className="animate-fade-up flex items-center gap-4 mb-3">
              <span className="text-3xl font-medium tracking-wide text-[#2d3150]">
                ₹{selectedShade?.effective_price || product?.effective_price || "0.00"}
              </span>
              {selectedShade && (
                <span className="text-[11px] font-bold tracking-[0.15em] bg-[#2d3150] text-[#F0D4DD] px-3.5 py-1.5 rounded-full uppercase">
                  {selectedShade?.attributes?.size || selectedShade?.name}
                </span>
              )}
            </div>
            {product?.variants && product.variants.length > 0 && (
              <div className="animate-fade-up mb-8">
                <p className="text-[11px] tracking-[0.2em] font-bold text-[#2d3150] mb-3 uppercase">SELECT VARIANT</p>
                <div className="flex items-center gap-3.5">
                  {product.variants.map((variant, idx) => (
                    <div key={variant.id || idx} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => handleShadeChange(variant)}
                        title={variant.attributes?.size || variant.name}
                        className={`w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 relative flex items-center justify-center
                          ${selectedShade?.id === variant.id
                            ? "border-[#2d3150] scale-105 shadow-[0_0_12px_rgba(0,0,0,0.08)]"
                            : "border-transparent"
                          }
                        `}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 relative bg-white flex items-center justify-center">
                          <img
                            src={variant.images?.length > 0 ? variant.images[0].image : (product.images?.length > 0 ? product.images[0].image : '/placeholder.png')}
                            alt={variant.attributes?.size || variant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {selectedShade?.id === variant.id && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2d3150] text-white rounded-full flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </button>
                      <span className="text-[10px] font-semibold text-[#2d3150] uppercase tracking-wide">
                        {variant.attributes?.size || variant.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Description */}
            <div className="animate-fade-up mb-8 max-w-xl">
              <p className="text-xs sm:text-[13px] leading-[1.8] text-[#5c6080] tracking-wider uppercase font-medium whitespace-pre-wrap">
                {product?.description || "STEP UP YOUR CLEANSING GAME WITH THIS MULTI ACTION GLOW GIVER THAT COMBINES A GENTLE DOSE OF SKIN CARE HOLY GRAIL - GLYCOLIC ACID, ALONG WITH A MIX OF POTENT ANTIOXIDANTS, HYDRATION AND RESTORING AGENTS - CENTELLA ASIATICA, TURMERIC AND LICORICE."}
              </p>
            </div>

            {/* Shade Swatch Selector */}


            {/* QTY & ADD TO CART CTA */}
            <div className="animate-fade-up flex flex-col sm:flex-row items-stretch gap-4 mb-10">
              <button
                onClick={handleAddToWishlist}
                className="w-[52px] h-[52px] shrink-0 bg-white border border-[#2d3150]/15 hover:border-[#C18386] text-[#2d3150] hover:text-[#C18386] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                aria-label="Add to wishlist"
              >
                <Heart size={20} strokeWidth={2} />
              </button>
              {/* Quantity Counter */}
              <div className="flex items-center justify-between border border-[#2d3150]/15 rounded-xl px-5 py-4 sm:w-36 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                <button
                  onClick={() => adjustQuantity(-1)}
                  className="text-[#2d3150] hover:text-[#C18386] transition-colors p-1.5"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>

                <span className="text-sm font-semibold tracking-wide w-6 text-center select-none text-[#2d3150]">
                  {quantity}
                </span>

                <button
                  onClick={() => adjustQuantity(1)}
                  className="text-[#2d3150] hover:text-[#C18386] transition-colors p-1.5"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Main Add Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#C18386] hover:bg-[#b07376] text-white rounded-xl py-4.5 px-6 font-semibold tracking-[0.15em] text-xs flex items-center justify-between shadow-[0_12px_24px_rgba(193,131,134,0.22)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 uppercase"
              >
                <span>ADD TO CART</span>
                <ShoppingBag size={15} className="stroke-[2.5]" />
              </button>

              {/* Wishlist Button */}


            </div>

            {/* Bottom Trust Indicators Grid */}
            <div className="animate-fade-up grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#2d3150]/10 pt-8 mt-4">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f1f0ee] text-[#2d3150] flex items-center justify-center shrink-0">
                  <RotateCcw size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-wider leading-none text-[#2d3150]">30 DAYS</span>
                  <span className="text-[9px] font-medium tracking-wide text-[#767676] mt-0.5">Return</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f1f0ee] text-[#2d3150] flex items-center justify-center shrink-0">
                  <Truck size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-wider leading-none text-[#2d3150]">FREE</span>
                  <span className="text-[9px] font-medium tracking-wide text-[#767676] mt-0.5">Shipping</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f1f0ee] text-[#2d3150] flex items-center justify-center shrink-0">
                  <Heart size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-wider leading-none text-[#2d3150]">VEGAN</span>
                  <span className="text-[9px] font-medium tracking-wide text-[#767676] mt-0.5">Cruelty Free</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f1f0ee] text-[#2d3150] flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-wider leading-none text-[#2d3150]">SECURE</span>
                  <span className="text-[9px] font-medium tracking-wide text-[#767676] mt-0.5">Checkout</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: PREMIUM MID CONTENT VISUAL SHOWCASE */}
      {/* ========================================================================= */}


      <section ref={midSectionRef} className="bg-white relative w-full overflow-hidden flex flex-col pt-12 lg:pt-20 pb-12 lg:pb-20">

        {/* Main Container */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 relative z-10 w-full">

          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 w-full">

            {/* Left Side: Left Image */}
            <div className="mid-image-left hidden lg:block relative w-[240px] lg:w-[320px] h-[300px] lg:h-[400px] shrink-0 mt-4">
              <Image
                src="/detials-p3.png"
                alt="Product Detail"
                fill
                className="object-contain object-left object-top"
              />
            </div>

            {/* Right Side: Heading, Lists, and Right Image */}
            <div className="flex-1 w-full flex flex-col">

              {/* Heading */}
              <div className="max-w-[800px] mb-8 lg:mb-12 relative z-10 text-left lg:text-center lg:mx-auto">
                <h2 className="mid-text-main text-[#2d3150] text-3xl sm:text-4xl lg:text-[42px] leading-[1.2] font-normal font-dm-serif tracking-normal">
                  A boost of anti-oxidant rich<br className="hidden md:block" />
                  nourishing <span className="font-yellowtail text-[50px] pr-1 font-normal opacity-90 text-[#393F59]">renewal</span> for dull, dry<br className="hidden md:block" />
                  and tired skin.
                </h2>
              </div>

              {/* Lists and Right Image Side-by-Side */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-12 w-full mt-4">

                {/* Lists */}
                <div className="flex flex-col sm:flex-row gap-12 lg:gap-20 text-left" style={{ fontFamily: "'DM Sans', sans-serif" }}>

                  {/* Column 1 */}
                  <div className="mid-column-fade">
                    <p className="text-[15px] font-bold text-[#767676] mb-4 uppercase tracking-wider">RECOMMENDED FOR</p>
                    <ul className="space-y-3">
                      {["Dull Skin", "Hyper Pigmentation", "Uneven Skin Tone", "Excess Oil", "Enlarged Pores"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[17px] font-normal text-[#2d3150]">
                          <span className="text-[#2d3150] text-[18px] leading-none">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2 */}
                  <div className="mid-column-fade">
                    <p className="text-[15px] font-bold text-[#767676] mb-4 uppercase tracking-wider">GOOD TO KNOW</p>
                    <ul className="space-y-3">
                      {[
                        "pH: 4.8",
                        "Clean, Verified Ingredients",
                        "Vegan, Cruelty-Free",
                        "No Artificial Colours Added",
                        "For All Skin-Types"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[17px] font-normal text-[#2d3150]">
                          <span className="text-[#2d3150]">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Right Image */}
                <div className="mid-image-right hidden lg:block relative shrink-0">
                  <Image
                    src="/details-p2.png"
                    alt="Premium Gold Lipstick on Platform"
                    width={220}
                    height={300}
                    className="object-contain object-top"
                  />
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: INTERACTIVE TABBED DETAILS ("all about the PRODUCT") */}
      {/* ========================================================================= */}
      <section ref={tabsSectionRef} className="py-12 lg:py-16 bg-[#F2F2F2] border-t border-b border-[#2d3150]/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Title */}
          <div className="tabs-header-animate text-center flex flex-col items-center mb-8">
            <span className="font-yellowtail text-[#2d3150] text-4xl mb-2 select-none">all about the</span>
            <h2 className="text-[#2d3150] text-4xl sm:text-[3.5rem] font-medium tracking-wide uppercase font-dm-serif">
              PRODUCT
            </h2>
          </div>

          {/* Interactive Navigation Tabs Buttons */}
          <div className="tabs-header-animate flex justify-center mb-10">
            <div className="flex flex-wrap items-center bg-white rounded-full p-[6px] w-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              {[
                { id: "about", label: "About" },
                { id: "ingredients", label: "Ingredients" },
                { id: "usage", label: "Usage" },
                { id: "faq", label: "FAQ" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ fontFamily: "'Actor', sans-serif" }}
                  className={`flex-1 min-w-[80px] text-center text-[18px] lg:text-[22px] font-normal tracking-normal py-[10px] px-4 rounded-full transition-all duration-300
                    ${activeTab === tab.id
                      ? "bg-[#393F59] text-white"
                      : "text-[#2d3150] hover:bg-black/5"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Panel Content Box */}
          <div className="tabs-content-animate w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

              {/* Left Column: Full height image */}
              <div className="relative w-full min-h-[400px] lg:min-h-full">
                <Image
                  src="/details-p1.png"
                  alt="Product Details Background"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Right Column: Dynamic tab content display */}
              <div className="flex flex-col justify-center p-12 sm:p-16 lg:p-24">

                {/* TAB 1: ABOUT */}
                {activeTab === "about" && (
                  <div className="space-y-12 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-medium text-[#767676] mb-6 uppercase tracking-wider">ABOUT THE PRODUCT</h3>
                      <p className="text-[16px] sm:text-[18px] lg:text-[20px] leading-[1.6] text-[#2d3150] font-medium">
                        A boost of anti-oxidant rich nourishing renewal for dull, dry and tired skin, this super-absorbable oil will help with clearing dark spots & blemishes and creating an even-looking, brighter complexion. It glides like a dream and hydrates up to 24 hours without feeling heavy.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-4">
                      <div>
                        <p className="text-[12px] tracking-[0.2em] font-medium text-[#767676] mb-5 uppercase">RECOMMENDED FOR</p>
                        <ul className="space-y-3.5 text-[15px] font-medium text-[#2d3150]">
                          {["Dull Skin", "Hyper Pigmentation", "Uneven Skin Tone", "Excess Oil", "Enlarged Pores"].map((it, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <span className="w-[4px] h-[4px] rounded-full bg-[#2d3150]/60" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[12px] tracking-[0.2em] font-medium text-[#767676] mb-5 uppercase">SUITABLE FOR</p>
                        <ul className="space-y-3.5 text-[15px] font-medium text-[#2d3150]">
                          {["Unisex Skin Care For All Skin Types", "Pregnancy Safe", "Sensitive Skin Approved"].map((it, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <span className="w-[4px] h-[4px] rounded-full bg-[#2d3150]/60" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: INGREDIENTS */}
                {activeTab === "ingredients" && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold font-dm-serif text-[#2d3150] mb-4 uppercase tracking-wide">KEY ACTIVE INGREDIENTS</h3>
                      <p className="text-sm leading-[1.8] text-[#5c6080] font-medium tracking-wide mb-6">
                        Lumora lip cosmetics are clean-formulated, prioritizing natural nourishment with science-backed efficacy. Free from parabens, mineral oils, and synthetic fragrances.
                      </p>
                    </div>

                    <div className="space-y-4">

                      <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#f1f0ee]/40 border border-[#2d3150]/5">
                        <div className="w-10 h-10 rounded-full bg-[#F0D4DD] text-[#C18386] flex items-center justify-center shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wider text-[#2d3150] uppercase mb-1">GLYCOLIC ACID (AHA)</p>
                          <p className="text-xs text-[#5c6080] leading-relaxed">Gently resurfaces dry textures to leave lips beautifully smooth, plump, and clear of dead cells.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#f1f0ee]/40 border border-[#2d3150]/5">
                        <div className="w-10 h-10 rounded-full bg-[#f3e1d3] text-[#dda15e] flex items-center justify-center shrink-0">
                          <Info size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wider text-[#2d3150] uppercase mb-1">CENTELLA ASIATICA & TURMERIC</p>
                          <p className="text-xs text-[#5c6080] leading-relaxed">Potent botanical repair block that heals chapping, reduces hyper-pigmentation and restores a youthful, organic lip color.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 3: USAGE */}
                {activeTab === "usage" && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-2xl font-bold font-dm-serif text-[#2d3150] mb-4 uppercase tracking-wide">HOW TO USE</h3>
                    <p className="text-sm leading-[1.8] text-[#5c6080] font-medium tracking-wide mb-6">
                      For a seamless editorial glide and long-lasting matte look, follow this minimalist routine:
                    </p>

                    <div className="space-y-4">
                      {[
                        { step: "01", title: "PREP & EXFOLIATE", desc: "Ensure your lips are dry and exfoliated. Apply a small amount of balm and swipe off any excess." },
                        { step: "02", title: "DEFINE & OUTLINE", desc: "Outline your lips using the edge of the angled lipstick bullet for high precision definition." },
                        { step: "03", title: "GLIDE & PLUMP", desc: "Swipe the rich creamy matte color directly across lips. Apply one coat for natural flush, two for full coverage." }
                      ].map((item, index) => (
                        <div key={index} className="flex gap-5 items-start">
                          <span className="text-xl font-bold text-[#C18386] font-dm-serif tracking-widest">{item.step}</span>
                          <div>
                            <p className="text-xs font-bold tracking-wider text-[#2d3150] uppercase mb-1">{item.title}</p>
                            <p className="text-xs text-[#5c6080] leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: FAQ */}
                {activeTab === "faq" && (
                  <div className="space-y-4 animate-fade-in max-h-[440px] overflow-y-auto pr-2 no-scrollbar">
                    <h3 className="text-2xl font-bold font-dm-serif text-[#2d3150] mb-4 uppercase tracking-wide">FREQUENTLY ASKED QUESTIONS</h3>

                    {[
                      { q: "Is the Veloura Matte Lipstick drying on lips?", a: "Not at all! Unlike traditional dry matte sticks, Veloura is enriched with Centella Asiatica and restorative natural humectants. It locks in hydration for up to 24 hours while delivering a clean velvet matte finish." },
                      { q: "How long does the color wear remain perfect?", a: "It provides a highly persistent lock-in wear that lasts up to 8 hours through eating and drinking. We recommend avoiding heavy oily foods to keep the pigment intact." },
                      { q: "Is this product safe for sensitive skin or pregnancy?", a: "Yes, 100%. Our formulations are entirely clean, certified vegan, cruelty-free, and pregnancy safe, developed with non-toxic dermatologically tested botanicals." }
                    ].map((item, index) => (
                      <div key={index} className="border border-[#2d3150]/10 rounded-xl overflow-hidden bg-[#fbfaf8]/50">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs tracking-wider text-[#2d3150] uppercase hover:bg-black/5 transition-colors"
                        >
                          <span>{item.q}</span>
                          <span className="text-[#C18386]">{expandedFaq === index ? "−" : "+"}</span>
                        </button>

                        {expandedFaq === index && (
                          <div className="p-4 pt-0 text-xs text-[#5c6080] leading-[1.7] border-t border-[#2d3150]/5 bg-white">
                            {item.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: "featured" CAROUSEL */}
      {/* ========================================================================= */}
      <section ref={featuredSectionRef} className="py-16 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20">

          {/* Header & Controls */}
          <div className="relative flex items-center justify-end mb-10 w-full">

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <h2 className="font-yellowtail text-[#2d3150] text-[44px] leading-none select-none">
                featured
              </h2>
            </div>

            {/* Slider control buttons */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => scrollCarousel("left")}
                className="w-[42px] h-[42px] rounded-full bg-[#E5CDC9] hover:bg-[#dcbcb7] text-[#2d3150] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="w-[42px] h-[42px] rounded-full bg-[#E5CDC9] hover:bg-[#dcbcb7] text-[#2d3150] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>

          </div>

          {/* Product Rail Horizontal Scroll View */}
          <div
            ref={carouselRef}
            className="flex gap-6 sm:gap-8 py-6 overflow-x-auto scrollbar-none no-scrollbar snap-x snap-mandatory cursor-grab select-none will-change-transform"
          >
            {FEATURED_PRODUCTS.map((prod, idx) => (
              <div
                key={idx}
                className={`featured-card group relative w-[280px] sm:w-[320px] flex-shrink-0 rounded-[20px] ${prod.bg} p-5 sm:p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 snap-center`}
              >
                {/* Top Badge & Bag Icon */}
                <div className="mb-4 flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-medium tracking-wide bg-white text-[#2d3150] px-4 py-1.5 rounded-full uppercase">
                    {prod.tag}
                  </span>
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2d3150] shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:scale-110 transition-transform">
                    <ShoppingBag size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Product centered visual */}
                <div className="relative h-[220px] sm:h-[280px] mb-6 select-none pointer-events-none">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    draggable={false}
                    className="object-contain scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Product label and price */}
                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-[#2d3150] text-[20px] font-normal" style={{ fontFamily: "'Actor', sans-serif" }}>
                    {prod.name}
                  </h3>
                  <span className="text-[#2d3150] text-[20px] font-normal" style={{ fontFamily: "'Actor', sans-serif" }}>
                    {prod.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <Footer />

    </main>
  );
}
