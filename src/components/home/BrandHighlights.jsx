"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, FlaskConical } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "100% Natural",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page. The purpose of using simple and clean text is to keep the focus on what truly matters — the product and its quality.",
    icon: <Leaf className="w-7 h-7 stroke-1" />,
  },
  {
    title: "Lab Tasted Approved Formulas",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page. The purpose of using simple and clean text is to keep the focus on what truly matters — the product and its quality.",
    icon: <FlaskConical className="w-7 h-7 stroke-1" />,
  },
  {
    title: "100% Natural",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page. The purpose of using simple and clean text is to keep the focus on what truly matters — the product and its quality.",
    icon: <Leaf className="w-7 h-7 stroke-1" />,
  },
  {
    title: "Lab Tasted Approved Formulas",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page. The purpose of using simple and clean text is to keep the focus on what truly matters — the product and its quality.",
    icon: <FlaskConical className="w-7 h-7 stroke-1" />,
  },
  {
    title: "Lab Tasted Approved Formulas",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page. The purpose of using simple and clean text is to keep the focus on what truly matters — the product and its quality.",
    icon: <FlaskConical className="w-7 h-7 stroke-1" />,
  },
];
const kitchenEssentials = [
  {
    title: "Kitchen Essentials",
    image: "/highlight-pic3.png",
  },
  {
    title: "Kitchen Essentials",
    image: "/highlight-pic1.png",
  },
  {
    title: "Kitchen Essentials",
    image: "/highlight-pic2.png",
  },

]

const BrandHighlights = () => {

  const featuresRef = useRef(null);
  const titleRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorX = useRef(null);
  const cursorY = useRef(null);

  const [activeFeature, setActiveFeature] = useState(0);

  const handleMouseEnter = () => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseMove = (e) => {
    if (cursorX.current && cursorY.current) {
      cursorX.current(e.clientX - 48);
      cursorY.current(e.clientY - 48);
    }
  };

  useEffect(() => {

    const slider = featuresRef.current;

    if (!slider) return;

    if (cursorRef.current) {
      cursorX.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.2, ease: "power3" });
      cursorY.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.2, ease: "power3" });
    }

    let isDown = false;
    let startX;
    let scrollLeft;

    // TITLE ANIMATION
    const titleItems =
      titleRef.current.querySelectorAll(".title-reveal");

    gsap.fromTo(
      titleItems,
      {
        y: 120,
        opacity: 0,
        rotateX: 18,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,

        stagger: 0.12,

        duration: 1.4,

        ease: "power4.out",

        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 88%",
        },
      }
    );
    // KITCHEN IMAGE PARALLAX
    // KITCHEN IMAGE PARALLAX
    gsap.utils.toArray(".kitchen-card").forEach((card, index) => {

      gsap.fromTo(
        card,
        {
          y: 50,
        },
        {
          y: -50 - (index * 20),

          ease: "none",

          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        }
      );

    });
    // ACTIVE FEATURE
    const updateActiveFeature = () => {

      const cards = slider.querySelectorAll(".feature-card");

      let active = 0;

      cards.forEach((card, index) => {

        const rect = card.getBoundingClientRect();

        // NORMAL ACTIVE DETECTION
        if (rect.left <= window.innerWidth * 0.35) {
          active = index;
        }

      });

      // LAST CARD FIX
      const maxScrollLeft =
        slider.scrollWidth - slider.clientWidth;

      if (slider.scrollLeft >= maxScrollLeft - 10) {
        active = cards.length - 1;
      }

      setActiveFeature(active);
    };

    // DRAG START
    const onMouseDown = (e) => {

      isDown = true;

      slider.classList.add("cursor-grabbing");

      startX = e.pageX - slider.offsetLeft;

      scrollLeft = slider.scrollLeft;
    };

    // DRAG END
    const onMouseLeave = () => {

      isDown = false;

      slider.classList.remove("cursor-grabbing");
    };

    const onMouseUp = () => {

      isDown = false;

      slider.classList.remove("cursor-grabbing");
    };

    // DRAG MOVE
    const onMouseMove = (e) => {

      if (!isDown) return;

      e.preventDefault();

      const x = e.pageX - slider.offsetLeft;

      const walk = (x - startX) * 1.2;

      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);

    slider.addEventListener("scroll", updateActiveFeature);

    updateActiveFeature();

    return () => {

      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);

      slider.removeEventListener("scroll", updateActiveFeature);
    };

  }, []);

  return (
    <section className=" py-20 lg:py-25 overflow-hidden">

      <div className="max-w-[1400px]">
        <div className="pb-16">
          {/* TITLE */}
          <div
            ref={titleRef}
            className="mb-10 px-5 sm:px-3 lg:px-10 overflow-hidden"
          >

            <div className="overflow-hidden">

              <h2 className=" title-reveal text-[#393F59] text-3xl sm:text-4xl lg:text-6xl leading-[100%] font-dm-serif">
                What Makes Our
              </h2>

            </div>

            <div className="ml-12 sm:ml-20 overflow-hidden">

              <h2
                className="title-reveal text-[#393F59] text-3xl sm:text-4xl lg:text-6xl leading-[100%] font-dm-serif">
                Product Stand Out
              </h2>

            </div>

          </div>

          {/* FEATURES CONTAINER */}
          <div className="relative">

            {/* STATIC LINE */}
            <div className="absolute top-[5px] left-0 right-0 h-[1px] bg-[#d8d3cf]" />

            <div
              ref={featuresRef} className="flex overflow-x-auto no-scrollbar gap-8 lg:gap-16 relative cursor-grab active:cursor-grabbing select-none pb-4 px-5 sm:px-3 lg:px-10">

              {features.map((item, index) => (
                <div
                  key={index}
                  className="feature-card min-w-[320px] sm:min-w-[420px] lg:min-w-[520px] flex-shrink-0 relative pt-10">
                  {/* DOT */}
                  <div
                    className={`absolute top-[1px] left-0 w-[10px] h-[10px] rounded-full z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${activeFeature >= index ? ` bg-[#2d3150]  border border-[#2d3150]  scale-[1.15] shadow-[0_0_10px_rgba(45,49,80,0.18)] ` : `bg-[#f3f1ef]  border border-[#999]`}`} />
                  {/* ICON */}
                  <div className="mb-4 text-[#f4a261]">
                    {item.icon}
                  </div>
                  {/* TITLE */}
                  <h3 className="text-[#2d3150] font-DM_Serif_Display text-xl mb-3">
                    {item.title}
                  </h3>

                  {/* DESC */}
                  <p className="text-[#7f7f7f] leading-[1.7] text-[15px] max-w-[500px]">
                    {item.description}
                  </p>

                </div>
              ))}

            </div>

            <div className="right-6 bottom-3 z-50 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#8f8f8f] pointer-events-none animate-pulse">
              Swipe

              <span className="text-sm tracking-tighter">
                »»
              </span>
            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 pt-16 lg:pt-14 pb-2 items-start">

          {/* LEFT */}
          <div className="pl-10">

            <h2 className="text-[#2d3150] text-4xl sm:text-5xl lg:text-5xl leading-[1.05] font-dm-serif my-6">
              Crafted For Confidence, <br />
              Made With Love!
            </h2>

            {/* SMALL IMAGE */}
            <div className="relative w-[190px] sm:w-[220px] h-[260px] sm:h-[320px] md:h-[260px] overflow-hidden mb-5">

              <Image
                src="/highlight-pic1.png"
                alt="Beauty Product"
                fill
                className="object-cover"
              />

            </div>

            {/* TEXT */}
            <div>
              <span className="text-[#2d3150] border rounded-xl px-3 py-0.5 text-xs mb-3">
                QUALITY
              </span>

              <p className="text-[#130D40] text-2xl lg:text-2xl font-small max-w-[290px] mb-5">
                Only proven Ingredients,
                quality over quantity always!
              </p>

              <p className="text-[#767676] text-sm max-w-[450px] pb-3 border-b border-[#d8d3cf]">
                It is about what we don’t put in. Squaicy clean formulas with over 1500 Negative ingredients.
              </p>

            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="relative overflow-hidden ">

            <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[630px]">

              <Image
                src="/highlight-pic2.png"
                alt="Luxury Skincare"
                fill
                className="object-cover"
              />

            </div>

            {/* BUTTON & SHOP NOW */}
            <Link href="/products" className="group">
              <div
                className="
                  absolute top-6 right-6 w-13 h-13 rounded-full bg-[#393F59] text-[#F2F2F2] flex items-center justify-center transition-all duration-500 hover:scale-95 rotate-340 origin-left">
                <ArrowRight className="w-6 h-6 stroke-[2.0]" />
              </div>

              <div className="absolute top-19 right-4 ">
                <p className="text-[#130D40] text-xs tracking-[0.1rem] font-medium uppercase underline">
                  Shop Now
                </p>
              </div>
            </Link>

          </div>

        </div>
        {/* KITCHEN ESSENTIALS */}
        <div className="flex flex-col lg:flex-row justify-around gap-2 lg:gap-1 items-center pt-24 lg:pt-28 overflow-hidden">
          {/* LEFT IMAGE COLUMN */}
          <div 
            className="h-[450px] lg:h-[470px] overflow-y-auto no-scrollbar w-full lg:w-1/2 px-4 lg:pr-4 cursor-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >

            <div className="flex flex-col items-center lg:items-start gap-8">

              {kitchenEssentials.map((item, index) => (

                <div key={index} className={`overflow-hidden`}>

                  {/* IMAGE */}
                  <div className="relative w-[220px] sm:w-[260px] lg:w-md h-[300px] sm:h-[360px] lg:h-[490px] overflow-hidden">

                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full lg:w-1/2  flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* TITLE */}
            <h2 className="text-[#2d3150] text-4xl sm:text-5xl lg:text-[68px] font-dm-serif mb-6 lg:mb-8">
              Kitchen Essentials
            </h2>

            {/* DESC */}
            <p className="text-[#151B1D] text-[15px] lg:text-xl w-full sm:w-[80%] lg:w-[85%] mb-8 lg:mb-10">
              Discover a range of kitchen essentials designed to simplify your everyday cooking. With practical tools and modern designs, we help you save time, reduce effort, and enjoy every moment in your kitchen.
            </p>


            <Link href="/products" className="flex flex-col items-center lg:items-start justify-center group">
              <div
                className="
                   w-10 h-10  rounded-full bg-[#393F59] text-[#F2F2F2] flex items-center justify-center transition-all duration-500 hover:scale-95 rotate-340 origin-left">
                <ArrowRight className="w-6 h-6 stroke-[2.0]" />
              </div>

              {/* SHOP NOW */}
              <div className=" top-19  ">

                <p className="text-[#130D40] text-xs tracking-[0.1rem] font-medium uppercase underline">
                  Shop Now
                </p>

              </div>
            </Link>

          </div>

        </div>
      </div>

      {/* CUSTOM CURSOR */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-24 h-24 bg-white/95 backdrop-blur-sm rounded-full pointer-events-none z-[100] flex items-center justify-center opacity-0 scale-0 shadow-lg"
      >
        <span className="text-[#393F59] text-xs uppercase tracking-[0.15em] font-medium">Scroll</span>
      </div>
    </section>
  );
};

export default BrandHighlights;