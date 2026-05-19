"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PicksForYou = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isSmall = window.matchMedia("(max-width: 767px)").matches;

      const points = {
        enter: { x: isSmall ? 390 : 980, y: isSmall ? 62 : 112, rotate: 18 },
        right: { x: isSmall ? 170 : 610, y: isSmall ? 42 : 78, rotate: 14 },
        center: { x: isSmall ? -12 : -10, y: isSmall ? -16 : -16, rotate: 0 },
        left: { x: isSmall ? -170 : -610, y: isSmall ? 42 : 78, rotate: -14 },
        exit: { x: isSmall ? -390 : -980, y: isSmall ? 62 : 112, rotate: -18 },
      };

      gsap.set(".pick-card", {
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
        ".pick-title",
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
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );


      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 3.2,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        {},
        {
          duration: 0,
        },
        0
      )

        .to(
          ".card-1",
          {
            keyframes: [
              {
                ...points.right,
                opacity: 1,
                scale: 0.98,
                duration: 1.15,
                ease: "sine.out",
              },
              {
                ...points.center,
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "sine.inOut",
              },
              {
                ...points.left,
                opacity: 1,
                scale: 0.98,
                duration: 1.15,
                ease: "sine.inOut",
              },
              {
                ...points.exit,
                opacity: 0,
                scale: 0.94,
                duration: 1.25,
                ease: "sine.in",
              },
            ],
            duration: 5.05,
            ease: "none",
          },
          0.3
        )
        .to(
          ".card-2",
          {
            keyframes: [
              { ...points.right, opacity: 1, scale: 0.98, duration: 1.15, ease: "sine.out" },
              { ...points.center, opacity: 1, scale: 1.01, duration: 1.5, ease: "sine.inOut" },
              { ...points.left, opacity: 1, scale: 0.98, duration: 1.15, ease: "sine.inOut" },
              { ...points.exit, opacity: 0, scale: 0.94, duration: 1.25, ease: "sine.in" },
            ],
            duration: 5.05,
            ease: "none",
          },
          1.8
        )
        .to(
          ".card-3",
          {
            keyframes: [
              {
                ...points.right,
                opacity: 1,
                scale: 0.98,
                duration: 1.15,
                ease: "sine.out",
              },
              {
                ...points.center,
                opacity: 1,
                scale: 1.01,
                duration: 1.5,
                ease: "sine.inOut",
              },
              {
                ...points.left,
                opacity: 1,
                scale: 0.98,
                duration: 1.15,
                ease: "sine.inOut",
              },
              {
                ...points.exit,
                opacity: 0,
                scale: 0.94,
                duration: 1.25,
                ease: "sine.in",
              },
            ],
            duration: 5.05,
            ease: "none",
          },
          3.3
        )
        .to(
          ".card-4",
          {
            keyframes: [
              {
                ...points.right,
                opacity: 1,
                scale: 0.98,
                duration: 1.15,
                ease: "sine.out",
              },
              {
                ...points.center,
                opacity: 1,
                scale: 1.01,
                duration: 1.5,
                ease: "sine.inOut",
              },
              {
                ...points.left,
                opacity: 1,
                scale: 0.98,
                duration: 1.15,
                ease: "sine.inOut",
              },
              {
                ...points.exit,
                opacity: 0,
                scale: 0.94,
                duration: 1.25,
                ease: "sine.in",
              },
            ],
            duration: 5.05,
            ease: "none",
          },
          4.8
        )
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[760vh] bg-[#f1f0ee]">
      <div className="sticky top-0 flex h-screen min-h-[620px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden px-4">
          <h2
            className="
              pick-title
              max-w-full
              text-center
              text-6xl sm:text-6xl md:text-[7.9rem] lg:text-[13rem]
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

        <div
          className="
    pick-card
    card-1
    absolute
    left-1/2
    top-1/2
    z-20
    aspect-[127/180]
    w-[62vw] sm:w-[38vw] md:w-[22rem] lg:w-[28rem]  
     overflow-hidden
    bg-white
    shadow-[0_24px_70px_rgba(45,49,80,0.16)]
  "
        >
          <Image
            src="/pick1.png"
            alt="Skincare cleanser pick"
            fill
            priority
            sizes="(max-width: 767px) 56vw, 448px"
            className="object-cover"
          />
        </div>

        <div
          className="
            pick-card
            card-2
            absolute
            left-1/2
            top-1/2
            z-30
            aspect-[127/180]
w-[62vw] sm:w-[38vw] md:w-[22rem] lg:w-[28rem]  
  overflow-hidden
            bg-white
            shadow-[0_24px_70px_rgba(45,49,80,0.16)]
          "
        >
          <Image
            src="/pick2.png"
            alt="Foam cleanser pick"
            fill
            priority
            sizes="(max-width: 767px) 56vw, 448px"
            className="object-cover"
          />
        </div>

        <div
          className="
            pick-card
            card-3
            absolute
            left-1/2
            top-1/2
            z-10
            aspect-[127/180]
w-[62vw] sm:w-[38vw] md:w-[22rem] lg:w-[28rem]    overflow-hidden
            bg-white
            shadow-[0_24px_70px_rgba(45,49,80,0.16)]
          "
        >
          <Image
            src="/pick3.png"
            alt="Sunscreen pick"
            fill
            sizes="(max-width: 767px) 56vw, 448px"
            className="object-cover"
          />
        </div>
        <div
          className="
            pick-card
            card-4
            absolute
            left-1/2
            top-1/2
            z-10
            aspect-[127/180]
            w-[62vw] sm:w-[38vw] md:w-[22rem] lg:w-[28rem]    overflow-hidden
            bg-white
            shadow-[0_24px_70px_rgba(45,49,80,0.16)]
          "
        >
          <Image
            src="/pick3.png"
            alt="Sunscreen pick"
            fill
            sizes="(max-width: 767px) 56vw, 448px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default PicksForYou;
