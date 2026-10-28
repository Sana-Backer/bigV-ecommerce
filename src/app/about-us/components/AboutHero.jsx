"use client";

import React, { useRef, useState } from 'react';
import { Leaf, Search, Sparkles, FlaskConical, ArrowDown } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const cardData = [
  {
    title: "Conscious & Responsible",
    description: "Peta Certified Vegan And Cruelty Free. Our Products Are Always Housed In Responsible Packaging And Made Sustainably.",
    icon: <Leaf className="w-4 h-4 md:w-5 md:h-5" />,
    position: "top-[28%] md:top-[30%] xl:top-[30%] left-0 md:left-[1%] xl:left-[5%]",
    speed: -150
  },
  {
    title: "Radical Transparency",
    description: "No Black Boxes, Nothing To Hide. We Disclose Our Full Formulas, So You Will Never Have To Guess What's In It And How Much.",
    icon: <Search className="w-4 h-4 md:w-5 md:h-5" />,
    position: "top-0 md:top-[2%] xl:top-[8%] left-[20%] md:left-[24%] lg:left-[26%] xl:left-[30%]",
    speed: -80
  },
  {
    title: "Clean, Beyond Reproach",
    description: "Truly Clean With Only Verified Ingredients. And Free From Over 1600 Questionable Ingredients. Because What You Put On Your Skin Matters.",
    icon: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />,
    position: "bottom-0 md:bottom-[2%] xl:bottom-[8%] left-[34%] md:left-[38%] lg:left-[41%] xl:left-[45%]",
    speed: -120
  },
  {
    title: "Potent & Multi-Tasking",
    description: "Our Formulas Are Chock-A-Block With Actives, And Goldents. Skin Restoring Agents Backed By Dermal Science That Aim To Deliver Real Results.",
    icon: <FlaskConical className="w-4 h-4 md:w-5 md:h-5" />,
    position: "top-[28%] md:top-[32%] xl:top-[35%] right-0 md:right-[1%] xl:right-[5%]",
    speed: -100
  }
];

export default function AboutHero() {
  const containerRef = useRef(null);
  const mainImageRef = useRef(null);
  const cardsRef = useRef([]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const mobileSliderRef = useRef(null);

  const handleMobileScroll = () => {
    if (!mobileSliderRef.current) return;
    const scrollLeft = mobileSliderRef.current.scrollLeft;
    const cardWidth = mobileSliderRef.current.offsetWidth * 0.82;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeCardIndex && newIndex >= 0 && newIndex < cardData.length) {
      setActiveCardIndex(newIndex);
    }
  };

  const scrollToCard = (idx) => {
    if (!mobileSliderRef.current) return;
    const cardWidth = mobileSliderRef.current.offsetWidth * 0.82;
    mobileSliderRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: 'smooth'
    });
    setActiveCardIndex(idx);
  };

  useGSAP(() => {
    let mm = gsap.matchMedia();

    // Tablet: 768px to 1279px (subtle parallax so cards float nicely without collision)
    mm.add("(min-width: 768px) and (max-width: 1279px)", () => {
      if (mainImageRef.current) {
        gsap.to(mainImageRef.current, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        });

        gsap.fromTo(
          mainImageRef.current,
          { opacity: 0, scale: 0.95, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }
        );
      }

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const speed = (cardData[index]?.speed || -80) * 0.25;
        gsap.to(card, {
          y: speed,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        });
      });

      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.3 }
      );
    });

    // Desktop: >= 1280px (full parallax)
    mm.add("(min-width: 1280px)", () => {
      if (mainImageRef.current) {
        gsap.to(mainImageRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        });

        gsap.fromTo(
          mainImageRef.current,
          { opacity: 0, scale: 0.9, y: 50 },
          { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "power3.out" }
        );
      }

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const speed = cardData[index]?.speed || -80;
        gsap.to(card, {
          y: speed,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        });
      });

      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out", delay: 0.5 }
      );
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <>
      <section
        ref={containerRef}
        className="relative pt-10 md:pt-16 xl:pt-20 overflow-hidden pb-16 md:pb-24 xl:pb-40 m-auto"
      >
        {/* Decorative organic background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-orange-50/50 blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-stone-100/60 blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">

          {/* Header Section */}
          <div className="mb-8 md:mb-14 xl:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] mb-3 tracking-tight text-[#393F59]">
              About Us
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
              <p className="text-xs sm:text-sm tracking-[0.15em] uppercase text-[#767676] max-w-lg font-medium leading-relaxed">
                Unreservedly honest products that truly work.<br />
                Be kind to skin and the planet — No exceptions!
              </p>
              <div className="hidden md:flex items-center gap-2 text-[#393F59] font-yellowtail text-3xl md:text-4xl">
                <span>Our Story</span>
                <ArrowDown className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5] mt-1 md:mt-2" />
              </div>
            </div>
          </div>

          {/* Tablet & Desktop Floating Parallax Area (>= 768px) */}
          <div className="hidden md:block relative w-full h-[680px] md:h-[720px] lg:h-[800px] xl:h-[900px] mt-0">
            {/* Main Central Image */}
            <div
              ref={mainImageRef}
              className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-[62%] md:w-[60%] lg:w-[58%] xl:w-[55%] h-[74%] md:h-[72%] lg:h-[68%] xl:h-[65%] z-10 will-change-transform bg-stone-200"
              style={{
                borderRadius: '75% 29% 75% 29%',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)'
              }}
            >
              <img
                src="/about.png"
                alt="Skincare Model applying product"
                className="w-full h-full object-cover scale-100"
              />
            </div>

            {/* Floating Cards */}
            {cardData.map((card, index) => (
              <div
                key={index}
                ref={(el) => (cardsRef.current[index] = el)}
                className={`absolute z-20 will-change-transform bg-white/95 backdrop-blur-md p-4 md:p-5 lg:p-6 xl:p-8 rounded-2xl md:rounded-3xl shadow-[0_10px_35px_rgb(0,0,0,0.06)] w-[195px] md:w-[220px] lg:w-[250px] xl:w-[280px] text-center border border-white/70 flex flex-col items-center
                  ${card.position}
                  ${index === 1 || index === 2 ? 'z-30' : ''}
                `}
              >
                <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-stone-100 rounded-full flex items-center justify-center mb-2.5 md:mb-3.5 xl:mb-5 text-[#393F59] shadow-inner">
                  {card.icon}
                </div>
                <h3 className="text-[10px] md:text-[11px] lg:text-[11.5px] xl:text-xs font-bold tracking-widest uppercase mb-1.5 md:mb-2 xl:mb-3 text-[#393F59]">
                  {card.title}
                </h3>
                <p className="text-[9.5px] md:text-[10.5px] lg:text-[11px] xl:text-xs text-[#767676] leading-normal md:leading-[1.7] xl:leading-[1.8] font-medium">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Clean Layout (< 768px) */}
          <div className="block md:hidden w-full">
            {/* Central Leaf Image */}
            <div
              className="relative w-[82vw] max-w-[320px] aspect-[4/5] mx-auto overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-stone-200 my-4"
              style={{
                borderRadius: '75% 29% 75% 29%',
              }}
            >
              <img
                src="/about.png"
                alt="Skincare Model applying product"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md border border-white/80 whitespace-nowrap">
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#393F59] uppercase">
                  100% Pure &amp; Conscious
                </span>
              </div>
            </div>

            {/* Value Pillars Header */}
            <div className="flex items-center justify-between px-2 mt-8 mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#767676] uppercase block">
                  Core Values
                </span>
                <h3 className="text-xl font-serif text-[#393F59]">
                  What Sets Us Apart
                </h3>
              </div>
              <span className="text-[11px] text-[#767676] font-medium tracking-wide">
                Swipe &rarr;
              </span>
            </div>

            {/* Swipeable Snap Cards */}
            <div
              ref={mobileSliderRef}
              onScroll={handleMobileScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-2 pb-4 no-scrollbar scroll-smooth -mx-2"
            >
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className="snap-center shrink-0 w-[82vw] max-w-[310px] bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E6E4DD]/70 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-[#393F59] shadow-inner">
                    {card.icon}
                  </div>
                  <h4 className="text-xs font-bold tracking-widest uppercase mb-2 text-[#393F59]">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#767676] leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center items-center gap-2 mt-1 mb-8">
              {cardData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeCardIndex === idx ? "w-6 bg-[#393F59]" : "w-1.5 bg-[#393F59]/20"
                    }`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>
      <section className="w-full py-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

          {/* Top Text Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 md:mb-20 gap-8 md:gap-10">
            <div className="md:w-[55%]">
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#393F59] leading-tight tracking-tight">
                Thoughtful skincare,<br />
                designed for <span className="font-yellowtail text-4xl sm:text-5xl md:text-6xl text-[#393F59]">real skin</span>
              </h2>
            </div>

            <div className="md:w-[38%] flex flex-col items-start">
              <p className="text-[#767676] text-sm leading-relaxed mb-6 md:mb-8">
                <strong className="text-[#393F59] font-medium">Aurae</strong> was created with a simple belief: skincare should work with your skin, not overwhelm it. In a world full of complicated routines and overstated claims, we focus on clarity, balance, and effectiveness.
              </p>
              <Link href="/products" className="flex flex-col items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-[#393F59] flex items-center justify-center text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                  <ArrowUpRight size={20} strokeWidth={1.5} />
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase border-b border-[#393F59] pb-0.5 text-[#393F59]">
                  SHOP NOW
                </span>
              </Link>
            </div>
          </div>

          {/* Full Width Image */}
          <div className="w-full h-[320px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-stone-200 mb-16 md:mb-24 relative overflow-hidden rounded-2xl md:rounded-3xl">
            <img
              src="/about-2.png"
              alt="Thoughtful Skincare Collection"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Section */}
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 lg:gap-16 mb-12 md:mb-16">
              {/* Feature 1 */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="text-xs text-slate-400 font-serif italic">01 -</span>
                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#393F59]">SCIENCE-LED, SKIN-FIRST</h4>
                </div>
                <p className="text-xs md:text-sm text-[#767676] leading-relaxed pl-6 md:pl-8">
                  Our formulas are built using research-backed ingredients and dermatology-inspired principles.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="text-xs text-slate-400 font-serif italic">02 -</span>
                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#393F59]">TESTED FOR REAL USE</h4>
                </div>
                <p className="text-xs md:text-sm text-[#767676] leading-relaxed pl-6 md:pl-8">
                  Aurae products are developed to feel comfortable, absorb easily, and perform consistently.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col mb-4">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="text-xs text-slate-400 font-serif italic">03 -</span>
                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#393F59]">CLEAN BY INTENTION</h4>
                </div>
                <p className="text-xs md:text-sm text-[#767676] leading-relaxed pl-6 md:pl-8">
                  We carefully select every ingredient and avoid what your skin doesn't need.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8 md:gap-12">
              {/* Left Text */}
              <div className="md:w-[48%] lg:w-[45%]">
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-[54px] xl:text-[64px] text-[#22253B] leading-[1.15] mb-6 md:mb-8 tracking-tight">
                  Our <span className="font-yellowtail text-4xl sm:text-5xl md:text-5xl lg:text-[68px] xl:text-[76px] font-normal text-[#1A1C2E]">philosophy</span><br />
                  of thoughtful <span className="font-yellowtail text-4xl sm:text-5xl md:text-5xl lg:text-[68px] xl:text-[76px] font-normal text-[#1A1C2E]">care</span>
                </h2>
                <p className="text-[#393F59] text-base md:text-lg lg:text-[20px] xl:text-[22px] leading-relaxed max-w-md font-medium">
                  Skincare is not about perfection. It's about consistency, care, and respect for your skin's <span className="font-yellowtail text-2xl md:text-3xl lg:text-4xl text-[#393F59] mx-1">natural</span> process.
                </p>
              </div>

              {/* Right Collage */}
              <div className="md:w-[48%] lg:w-[50%] relative h-[380px] sm:h-[440px] md:h-[480px] lg:h-[550px] w-full mt-8 md:mt-0">
                {/* Back Image (Skin) */}
                <div className="absolute top-0 right-0 w-[55%] h-[60%] z-10 bg-stone-200">
                  <img src="/about-3.png" alt="Skin texture" className="w-full h-full object-cover" />
                </div>
                {/* Middle Image (Aloe) */}
                <div className="absolute top-[15%] right-[25%] w-[40%] h-[70%] z-20 bg-stone-100 shadow-xl border-4 border-[#fdfaf7]">
                  <img src="/about-3.png" alt="Aloe vera" className="w-full h-full object-cover" />
                </div>
                {/* Front Image (Oil) */}
                <div className="absolute bottom-[5%] left-[5%] md:left-[10%] w-[55%] h-[60%] z-30 bg-[#f4f2ef] shadow-2xl border-4 border-[#fdfaf7]">
                  <img src="/about-4.png" alt="Face oil" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
