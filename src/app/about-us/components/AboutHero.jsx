"use client";

import React, { useRef } from 'react';
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
    icon: <Leaf size={20} />,
    position: "top-[20%] md:top-[30%] left-[2%] md:left-[5%]",
    speed: -150
  },
  {
    title: "Radical Transparency",
    description: "No Black Boxes, Nothing To Hide. We Disclose Our Full Formulas, So You Will Never Have To Guess What's In It And How Much.",
    icon: <Search size={20} />,
    position: "top-[5%] md:top-[10%] left-[10%] md:left-[30%]",
    speed: -80
  },
  {
    title: "Clean, Beyond Reproach",
    description: "Truly Clean With Only Verified Ingredients. And Free From Over 1600 Questionable Ingredients. Because What You Put On Your Skin Matters.",
    icon: <Sparkles size={20} />,
    position: "bottom-[5%] md:bottom-[10%] left-[10%] md:left-[45%]",
    speed: -120
  },
  {
    title: "Potent & Multi-Tasking",
    description: "Our Formulas Are Chock-A-Block With Actives, And Goldents. Skin Restoring Agents Backed By Dermal Science That Aim To Deliver Real Results.",
    icon: <FlaskConical size={20} />,
    position: "bottom-[20%] md:bottom-[35%] right-[2%] md:right-[5%]",
    speed: -100
  }
];

export default function AboutHero() {
  const containerRef = useRef(null);
  const mainImageRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Main image slow parallax
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

      // Floating cards independent speeds
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const speed = cardData[index].speed;
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

      // Reveal staggered animation on load
      gsap.fromTo(
        mainImageRef.current,
        { opacity: 0, scale: 0.9, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "power3.out" }
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out", delay: 0.5 }
      );
    });

    mm.add("(max-width: 767px)", () => {
      // Mobile - reduced motion
      gsap.to(mainImageRef.current, {
        y: -15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.to(card, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <>
      <section
        ref={containerRef}
        className="relative pt-20  overflow-hidden pb-40 m-auto"
      >
        {/* Decorative organic background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-orange-50/50 blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-stone-100/60 blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">

          {/* Header Section */}
          <div className="mb-20">
            <h1 className=" text-5xl md:text-7xl lg:text-[5rem] mb-3 tracking-tight text-[#393F59] ">
              About Us
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <p className="text-xs md:text-sm tracking-[0.15em] uppercase text-[#767676] max-w-lg font-medium leading-relaxed">
                Unreservedly honest products that truly work.<br />
                Be kind to skin and the planet — No exceptions!
              </p>
              <div className="hidden md:flex items-center gap-2 text-[#393F59] font-yellowtail text-4xl">
                <span>Our Story</span>
                <ArrowDown className="w-6 h-6 stroke-[2.5] mt-2" />
              </div>
            </div>
          </div>

          {/* Interactive Parallax Area */}
          <div className="relative w-full h-[1000px] md:h-[900px] mt-0">

            {/* Main Central Image */}
            <div
              ref={mainImageRef}
              className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[55%] h-[50%] md:h-[65%] z-10 will-change-transform bg-stone-200"
              style={{
                borderRadius: '75% 29%  75% 29%', // This creates a perfect leaf shape!
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
                className={`absolute z-20 will-change-transform bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] w-[85%] md:max-w-[280px] text-center border border-white/60 flex flex-col items-center
                  ${card.position}
                  ${index === 1 || index === 2 ? 'md:z-30' : ''}
                `}
              >
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-5 text-stone-600 shadow-inner">
                  {card.icon}
                </div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-slate-800">
                  {card.title}
                </h3>
                <p className="text-[11px] md:text-xs text-slate-500 leading-[1.8] font-medium">
                  {card.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>
      <section className="w-full  py-1 ">
        <div className="max-w-[1400px] mx-auto px-6">

          {/* Top Text Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-10">
            <div className="md:w-[55%]">
              <h2 className="text-4xl md:text-5xl text-[#393F59] leading-tight tracking-tight">
                Thoughtful skincare,<br />
                designed for <span className="font-yellowtail text-5xl md:text-6xl text-[#393F59]">real skin</span>
              </h2>
            </div>

            <div className="md:w-[35%] flex flex-col items-start">
              <p className="text-[#767676] text-sm leading-relaxed mb-8">
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
          <div className="w-full h-[400px] md:h-[600px] bg-stone-200 mb-24 relative overflow-hidden">
            {/* Using a placeholder from unsplash similar to the vibe of the bottles */}
            <img
              src="/about-2.png"
              alt="Thoughtful Skincare Collection"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Section */}
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-10">
              {/* Feature 1 */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-slate-400 font-serif italic">01 -</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#393F59]">SCIENCE-LED, SKIN-FIRST</h4>
                </div>
                <p className="text-sm text-[#767676] leading-relaxed pl-8">
                  Our formulas are built using research-backed ingredients and dermatology-inspired principles.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-slate-400 font-serif italic">02 -</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#393F59]">TESTED FOR REAL USE</h4>
                </div>
                <p className="text-sm text-[#767676] leading-relaxed pl-8">
                  Aurae products are developed to feel comfortable, absorb easily, and perform consistently.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-slate-400 font-serif italic">03 -</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#393F59]">CLEAN BY INTENTION</h4>
                </div>
                <p className="text-sm text-[#767676] leading-relaxed pl-8">
                  We carefully select every ingredient and avoid what your skin doesn't need.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-12">
              {/* Left Text */}
              <div className="md:w-[45%]">
                <h2 className="text-5xl md:text-[64px] text-[#22253B] leading-[1.1] mb-8 tracking-tight">
                  Our <span className="font-yellowtail text-[56px] md:text-[76px] font-normal text-[#1A1C2E]">philosophy</span><br />
                  of thoughtful <span className="font-yellowtail text-[56px] md:text-[76px] font-normal text-[#1A1C2E]">care</span>
                </h2>
                <p className="text-[#393F59] text-lg md:text-[22px] leading-relaxed max-w-md font-medium">
                  Skincare is not about perfection. It's about consistency,care, and respect for your skin's <span className="font-yellowtail text-3xl md:text-4xl text-[#393F59] mx-1">natural</span> process.
                </p>
              </div>

              {/* Right Collage */}
              <div className="md:w-[50%] relative h-[450px] md:h-[550px] w-full mt-10 md:mt-0">
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
