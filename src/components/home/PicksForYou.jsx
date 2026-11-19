"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PicksForYou = () => {
  const desktopSectionRef = useRef(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  // Desktop GSAP Scroll Animation only
  useEffect(() => {
    // Only run GSAP on desktop (>= 768px)
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      const points = {
        enter: { x: 980, y: 112, rotate: 18 },
        right: { x: 610, y: 78, rotate: 14 },
        center: { x: -10, y: -16, rotate: 0 },
        left: { x: -610, y: 78, rotate: -14 },
        exit: { x: -980, y: 112, rotate: -18 },
      };

      gsap.set(".desktop-pick-card", {
        xPercent: -50,
        yPercent: -50,
        x: points.enter.x,
        y: points.enter.y,
        rotate: points.enter.rotate,
        scale: 0.96,
        opacity: 0,
        transformOrigin: "50% 50%",
      });

      gsap.fromTo(
        ".desktop-pick-title",
        {
          opacity: 0,
          scale: 0.75,
          y: 80,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.6,
          ease: "power4.out",
          scrollTrigger: {
            trigger: desktopSectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: desktopSectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 2.2,
          invalidateOnRefresh: true,
        },
      });

      tl.to({}, { duration: 0 }, 0)
        .to(
          ".card-1",
          {
            keyframes: [
              { ...points.right, opacity: 1, scale: 0.98, duration: 1.0, ease: "sine.out" },
              { ...points.center, opacity: 1, scale: 1, duration: 1.4, ease: "sine.inOut" },
              { ...points.left, opacity: 1, scale: 0.98, duration: 1.0, ease: "sine.inOut" },
              { ...points.exit, opacity: 0, scale: 0.94, duration: 1.0, ease: "sine.in" },
            ],
            duration: 4.4,
            ease: "none",
          },
          0
        )
        .to(
          ".card-2",
          {
            keyframes: [
              { ...points.right, opacity: 1, scale: 0.98, duration: 1.0, ease: "sine.out" },
              { ...points.center, opacity: 1, scale: 1.01, duration: 1.4, ease: "sine.inOut" },
              { ...points.left, opacity: 1, scale: 0.98, duration: 1.0, ease: "sine.inOut" },
              { ...points.exit, opacity: 0, scale: 0.94, duration: 1.0, ease: "sine.in" },
            ],
            duration: 4.4,
            ease: "none",
          },
          1.4
        )
        .to(
          ".card-3",
          {
            keyframes: [
              { ...points.right, opacity: 1, scale: 0.98, duration: 1.0, ease: "sine.out" },
              { ...points.center, opacity: 1, scale: 1.01, duration: 1.4, ease: "sine.inOut" },
              { ...points.left, opacity: 1, scale: 0.98, duration: 1.0, ease: "sine.inOut" },
              { ...points.exit, opacity: 0, scale: 0.94, duration: 1.0, ease: "sine.in" },
            ],
            duration: 4.4,
            ease: "none",
          },
          2.8
        );
    }, desktopSectionRef);

    return () => ctx.revert();
  }, []);

  const handleMobileScroll = (e) => {
    const el = e.currentTarget;
    const cardWidth = el.offsetWidth * 0.75;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveMobileIndex(Math.min(Math.max(index, 0), 2));
  };

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE EXPERIENCE (< 768px): Native, Clean Touch Showcase */}
      {/* ======================================================== */}
      <section className="md:hidden py-10 bg-[#FAF9F5] border-y border-[#ECE8DC]">
        {/* Title */}
        <div className="text-center px-4 mb-6">
          <p className="text-[10px] font-bold tracking-[0.28em] text-[#8C968D] uppercase mb-1.5">
            Curated For You
          </p>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#2d3150] leading-none">
            PURE PICKS FOR YOU
          </h2>
        </div>

        {/* Swipeable Product Cards Track */}
        <div
          onScroll={handleMobileScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 pt-1 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Card 1 */}
          <div className="w-[75vw] max-w-[270px] aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-[0_12px_35px_rgba(45,49,80,0.12)] shrink-0 snap-center relative border border-black/5">
            <Image
              src="/home/highlight1.png"
              alt="Curated pick 1"
              fill
              priority
              sizes="270px"
              className="object-cover"
            />
          </div>

          {/* Card 2 */}
          <div className="w-[75vw] max-w-[270px] aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-[0_12px_35px_rgba(45,49,80,0.12)] shrink-0 snap-center relative border border-black/5">
            <Image
              src="/home/highlight2.png"
              alt="Curated pick 2"
              fill
              priority
              sizes="270px"
              className="object-cover"
            />
          </div>

          {/* Card 3 */}
          <div className="w-[75vw] max-w-[270px] aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-[0_12px_35px_rgba(45,49,80,0.12)] shrink-0 snap-center relative border border-black/5">
            <Image
              src="/home/highlight3.png"
              alt="Curated pick 3"
              fill
              sizes="270px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeMobileIndex === idx ? "w-6 bg-[#2d3150]" : "w-1.5 bg-[#D5D3C8]"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* DESKTOP EXPERIENCE (>= 768px): Full-Screen GSAP Scroll   */}
      {/* ======================================================== */}
      <section
        ref={desktopSectionRef}
        className="hidden md:block relative h-[600vh]"
      >
        <div className="sticky top-0 flex h-screen min-h-[620px] items-center justify-center overflow-hidden">
          {/* Background Typography */}
          <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden px-4">
            <h2
              className="
                desktop-pick-title
                max-w-full
                text-center
                md:text-[7.9rem] lg:text-[13rem]
                font-bold
                uppercase
                leading-[0.94]
                tracking-normal
                text-[#2d3150]
              "
            >
              PURE PICKS <br />
              FOR YOU
            </h2>
          </div>

          {/* Card 1 */}
          <div
            className="
              desktop-pick-card
              card-1
              absolute
              left-1/2
              top-1/2
              z-20
              aspect-[127/180]
              md:w-[22rem] lg:w-[28rem]
              overflow-hidden
              bg-white
              shadow-[0_24px_70px_rgba(45,49,80,0.16)]
            "
          >
            <Image
              src="/home/highlight1.png"
              alt="Skincare cleanser pick"
              fill
              priority
              sizes="448px"
              className="object-cover"
            />
          </div>

          {/* Card 2 */}
          <div
            className="
              desktop-pick-card
              card-2
              absolute
              left-1/2
              top-1/2
              z-30
              aspect-[127/180]
              md:w-[22rem] lg:w-[28rem]
              overflow-hidden
              bg-white
              shadow-[0_24px_70px_rgba(45,49,80,0.16)]
            "
          >
            <Image
              src="/home/highlight2.png"
              alt="Foam cleanser pick"
              fill
              priority
              sizes="448px"
              className="object-cover"
            />
          </div>

          {/* Card 3 */}
          <div
            className="
              desktop-pick-card
              card-3
              absolute
              left-1/2
              top-1/2
              z-10
              aspect-[127/180]
              md:w-[22rem] lg:w-[28rem]
              overflow-hidden
              bg-white
              shadow-[0_24px_70px_rgba(45,49,80,0.16)]
            "
          >
            <Image
              src="/home/highlight3.png"
              alt="Sunscreen pick"
              fill
              sizes="448px"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default PicksForYou;
