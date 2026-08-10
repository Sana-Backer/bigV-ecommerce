"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const bannerRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add({
        isMobile: "(max-width: 767px)",
        isTablet: "(min-width: 768px) and (max-width: 1023px)",
        isDesktop: "(min-width: 1024px)"
      }, (context) => {
        let { isMobile, isTablet, isDesktop } = context.conditions;

        // 1. Subtle parallax effect on the banner image
        gsap.fromTo(
          bannerRef.current,
          { yPercent: isMobile ? -2 : -8 },
          {
            yPercent: isMobile ? 2 : (isTablet ? 6 : 14),
            ease: "none",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );

        // 2. Slide-up overlay effect on the links div (all devices)
        gsap.fromTo(
          linksRef.current,
          { y: isMobile ? 78 : 64 }, 
          {
            y: 0, 
            ease: "none",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className=" w-full overflow-hidden ">
      {/* Banner Image Container */}
      <div className="relative w-full h-[460px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div
          ref={bannerRef}
          className="absolute inset-0 w-full h-[116%] -top-[8%]"
        >
          <Image
            src="/footer-banner.png"
            alt="LUMORA Banner"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Footer Links Container */}
      <div
        ref={linksRef}
        className="relative z-10 bg-[#F2F2F2] pt-12 pb-12 md:pb-16 lg:pb-20 text-neutral-800 shadow-[0_-15px_35px_rgba(0,0,0,0.12)] -mt-12 lg:-mt-16 will-change-transform"
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          
          {/* Main Content Grid: Newsletter vs Links */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-12 md:gap-8 lg:gap-8 xl:gap-16 items-start">

            {/* HEAR MORE FROM US - NEWSLETTER CARD */}
            <div className="order-1 md:order-2 relative bg-[#353B50] text-white p-8 lg:p-10 flex flex-col items-center text-center -mt-24 sm:-mt-28 md:-mt-40 lg:-mt-52 xl:-mt-72 z-20 shadow-[0_-15px_35px_rgba(0,0,0,0.15)] rounded-sm mx-auto w-full md:col-span-5 md:max-w-none max-w-md">
              <h3 className="text-[white] text-2xl lg:text-5xl font-semibold tracking-[0.10rem] uppercase mb-4 leading-tight">
                HEAR MORE <br className="hidden sm:inline" /> FROM US
              </h3>

              <p className="text-[#ebe8e8] text-sm tracking-wider mb-8 max-w-[260px]">
                Get the latest news about skincare tips and new products.
              </p>

              <div className="w-full mb-6">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  className="w-full bg-transparent border border-[#ebebeb] rounded-full px-6 py-3 text-left text-xs tracking-[0.15em] placeholder:text-[#A2A1A1] text-white focus:outline-none focus:border-white transition-colors duration-300"
                />
              </div>

              <div className="flex flex-col items-center gap-3 mb-8 cursor-pointer group">
                <button className="w-12 h-12 rounded-full bg-white text-[#353B50] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ArrowUpRight className="w-5 h-5 stroke-[2]" />
                </button>
                <span className="text-white text-xs tracking-[0.2em] font-semibold uppercase underline underline-offset-4 decoration-neutral-500 group-hover:decoration-white transition-colors">
                  SUBSCRIBE
                </span>
              </div>

              <hr className="w-full border-[#FFFFFF] mb-3" />

              <p className="text-[#b6b3b3] text-[12px] tracking-wider leading-relaxed max-w-[250px]">
                No Spam, only quality articles to help you be more radiant. You can opt out anytime.
              </p>
            </div>

            {/* LINKS WRAPPER */}
            <div className="order-2 md:order-1 w-full md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-4 lg:gap-x-12 mt-2 md:mt-0">
              
              {/* EXPLORE */}
              <div className="flex flex-col">
                <h3 className="text-[#767676] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                  EXPLORE
                </h3>
                <ul className="flex flex-col gap-4 text-sm text-[#393F59] font-medium">
                  <li><Link href="/products" className="hover:text-black transition-colors duration-200">Shop</Link></li>
                  <li><Link href="/about-us" className="hover:text-black transition-colors duration-200">About</Link></li>
                  <li><Link href="#" className="hover:text-black transition-colors duration-200">Gallery</Link></li>
                  <li><Link href="/login" className="hover:text-black transition-colors duration-200">Sign Up/Login</Link></li>
                </ul>
              </div>

              {/* FOLLOW US */}
              <div className="flex flex-col">
                <h3 className="text-[#767676] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                  FOLLOW US
                </h3>
                <ul className="flex flex-col gap-4 text-sm text-[#393F59] font-medium">
                  <li>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors duration-200">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors duration-200">
                      Facebook
                    </a>
                  </li>
                </ul>
              </div>

              {/* CONTACT US */}
              <div className="flex flex-col col-span-2 md:col-span-1">
                <h3 className="text-[#767676] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                  CONTACT US
                </h3>
                <ul className="flex flex-col gap-4 text-sm text-[#393F59] font-medium">
                  <li>
                    <a href="mailto:lumana@gmail.com" className="hover:text-black transition-colors duration-200">
                      lumana@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:1111-2222-3333" className="hover:text-black transition-colors duration-200">
                      1111-2222-3333
                    </a>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* LARGE LOGO */}
          <div className="w-full mt-1 md:mt-4 lg:mt-2">
            <h2 className="text-neutral-800 border-t border-neutral-300/40 text-[16vw] sm:text-[12vw] lg:text-[14vw] xl:text-[12rem] text-center pt-8 sm:pt-12 font-bold tracking-[0.1em] uppercase leading-none w-full flex justify-center">
              LUMORA
            </h2>
          </div>

          {/* Brand & Copyright Footer Bar */}
          <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-xs text-neutral-500 text-center md:text-left">
            <div className="flex flex-col gap-2 items-center md:items-start">
              <p className="text-neutral-500 text-[11px] max-w-sm">
                Clean, Conscious, Clinical Skincare! Honest products that truly work.
              </p>
              <p className="text-neutral-400 mt-2 text-[10px]">
                &copy; {new Date().getFullYear()} LUMORA. All Rights Reserved.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] tracking-[0.1em] uppercase">
              <a href="#" className="hover:text-black transition-colors duration-200">Disclaimer</a>
              <a href="#" className="hover:text-black transition-colors duration-200">Credits</a>
              <p className="text-neutral-400">Website By: Sana-Backer</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
