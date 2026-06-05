"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ConnectWithUs = () => {

    const containerRef = useRef(null);
    const btnWrapperRef = useRef(null);
    const btnRef = useRef(null);
    
    const btnXTo = useRef(null);
    const btnYTo = useRef(null);

    useEffect(() => {

        const ctx = gsap.context(() => {

            // CLEAN REVEAL ONLY
            gsap.fromTo(
                ".fade-item",
                {
                    y: 60,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,

                    stagger: 0.12,

                    duration: 1.2,

                    ease: "power3.out",

                    scrollTrigger: {
                        trigger: ".connect-image-wrapper",
                        start: "top 82%",
                    },
                }
            );
            // CENTER IMAGE STAYS MOSTLY FIXED (SUBTLE PARALLAX)
            gsap.to(".center-card", {
                y: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: ".connect-image-wrapper",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // RESPONSIVE PARALLAX FOR SIDE CARDS
            let mm = gsap.matchMedia();

            mm.add({
                isMobile: "(max-width: 767px)",
                isDesktop: "(min-width: 768px)"
            }, (context) => {
                let { isMobile } = context.conditions;

                // LEFT IMAGE MOVES UP ON SCROLL DOWN
                gsap.to(".left-card", {
                    y: isMobile ? -60 : -350,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".connect-image-wrapper",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                });

                // RIGHT IMAGE MOVES AT A DIFFERENT SPEED
                gsap.to(".right-card", {
                    y: isMobile ? -90 : -400,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".connect-image-wrapper",
                        start: isMobile ? "top bottom" : "top 50%",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            });

            if (btnRef.current) {
                btnXTo.current = gsap.quickTo(btnRef.current, "x", { duration: 0.25, ease: "power2.out" });
                btnYTo.current = gsap.quickTo(btnRef.current, "y", { duration: 0.25, ease: "power2.out" });
            }

        }, containerRef);

        return () => ctx.revert();

    }, []);

    const handleMouseMove = (e) => {
        if (window.matchMedia("(hover: none)").matches) return;
        if (!btnWrapperRef.current) return;
        
        const { height, width, left, top } = btnWrapperRef.current.getBoundingClientRect();
        
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        
        if (btnXTo.current) btnXTo.current(distanceX * 0.4);
        if (btnYTo.current) btnYTo.current(distanceY * 0.4);
    };

    const handleMouseLeave = () => {
        if (btnXTo.current) {
            btnXTo.current(0);
            btnYTo.current(0);
        }
    };

    return (

        <section
            ref={containerRef}
            className="
        connect-section

        relative

        overflow-hidden

        py-14
        sm:py-16
        lg:py-29

      "
        >

            <div className="mx-auto px-5 sm:px-8 lg:px-10">

                <div
                    className="
            relative

            min-h-[470px]
            sm:min-h-[520px]
            lg:min-h-[530px]

            flex
            flex-col
            items-center
          "
                >

                    {/* TITLE */}
                    <h2
                        className="
              fade-item
              connect-title

              relative
              z-30

              text-center

              text-[#353B50]

              text-[34px]
              sm:text-[35px]
              lg:text-[70px]

              font-bold

              tracking-[0.02em]

              uppercase

              leading-[0.84]

              will-change-transform
            "
                    >
                        Connect
                        <br />
                        With Us
                    </h2>

                    {/* IMAGE WRAPPER */}
                    <div
                        className="connect-image-wrapper relative w-full max-w-[1400px] flex justify-center mt-6 sm:mt-0 lg:-mt-1">

                        {/* LEFT CARD */}
                        <div className="hidden sm:block absolute left-0 top-[1px] sm:top-[1px] lg:top-[70px] z-20 will-change-transform">
                            <div
                                className="left-card w-[100px] sm:w-[240px] lg:w-[280px] h-[130px] sm:h-[260px] lg:h-[250px] overflow-hidden will-change-transform">
                                <Image
                                    src="/img-left.png"
                                    alt="Skincare dropper bottles"
                                    fill
                                    sizes="(max-width: 640px) 122px, (max-width: 1024px) 205px, 300px"
                                    className="object-cover"
                                />

                            </div>
                        </div>

                        {/* CENTER CARD */}
                        <div
                            className="
                relative

                flex
                flex-col
                items-center

                z-10
              " >

                            <div className=" will-change-transform">
                                <div
                                    className="
                      center-card

                      relative

                     w-[78vw]
    max-w-[360px]
    sm:max-w-[560px]
    lg:max-w-[670px]

    h-[400px]
    sm:h-[460px]
    lg:h-[540px] overflow-hidden will-change-transform
                    "
                                >

                                    <Image
                                        src="/main-image.png"
                                        alt="Luxury skincare bottle"
                                        fill
                                        sizes="(max-width: 640px) 76vw, (max-width: 1024px) 505px, 560px"
                                        className="object-cover"
                                        priority
                                    />

                                </div>
                            </div>

                            {/* INSTAGRAM SCRIPT */}
                            <div
                                className="
                  instagram-script

                  absolute

                  bottom-[-8px]
                  sm:bottom-[-4px]
                  lg:bottom-[-9px]

                  z-30

                  flex
                  flex-col
                  items-center

                  will-change-transform
                "
                            >

                                <span
                                    className="
                    font-yellowtail

                    text-[#353535]

                    text-3xl
                    sm:text-4xl
                    lg:text-[46px]

                    leading-[0.75]
                  "
                                >
                                    On
                                </span>

                                <span
                                    className="
                    font-yellowtail
                    text-[#353535]  text-3xl
                    sm:text-4xl
                    lg:text-[46px]

                    leading-[0.72]
                  "
                                >
                                    instagram
                                </span>

                            </div>

                        </div>

                        {/* RIGHT CARD */}
                        <div className="hidden sm:block absolute right-0 bottom-[-20px] sm:bottom-[-200px] lg:bottom-[-300px] z-20 will-change-transform">
                            <div
                                className="
                    right-card

                    w-[90px]
    sm:w-[240px]
    lg:w-[280px]

    h-[120px]
    sm:h-[260px]
    lg:h-[290px]

                    overflow-hidden
                    will-change-transform
                  "
                            >

                                <Image
                                    src="/img-right.png"
                                    alt="Minimalist shampoo bottles"
                                    fill
                                    sizes="(max-width: 640px) 112px, (max-width: 1024px) 190px, 320px"
                                    className="object-cover"
                                />

                            </div>
                        </div>

                    </div>

                    {/* BUTTON */}
                    <div
                        className="
              instagram-btn
              fade-item

              flex
              justify-center

              mt-[58px]
              sm:mt-[64px]
              lg:mt-[40px]

              will-change-transform
            "
                    >
                        <div 
                            ref={btnWrapperRef}
                            className="inline-flex p-4 -m-4 sm:p-6 sm:-m-6 cursor-pointer touch-none"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <a
                                ref={btnRef}
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    flex
                                    items-center
                                    border
                                    border-[#767676]
                                    rounded-full
                                    overflow-hidden
                                    px-9 py-2.5
                                    hover:shadow-md
                                    transition-colors
                                    transition-shadow
                                    duration-300
                                    will-change-transform
                                "
                            >

                            <span
                                className="
                  text-[12px]
                  tracking-wide
                  uppercase
                  text-[#393F59]
                  mr-3
                "
                            >
                                Instagram
                            </span>

                            <div
                                className="
                  w-6
                  h-6
                  rounded-full
                  bg-[#353B50]
                  flex
                  items-center
                  justify-center
                "
                            >

                                <svg
                                    className="w-3.5 h-3.5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    viewBox="0 0 24 24"
                                >
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>

                            </div>

                        </a>
                        </div>
                    </div>

                </div>

            </div>

        </section>
    );
};

export default ConnectWithUs;