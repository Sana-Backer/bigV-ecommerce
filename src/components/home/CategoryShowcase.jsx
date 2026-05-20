"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, Draggable);

const categories = [
  {
    title: "Beauty",
    subtitle: "Products",
    banner: "/category1.jpg",
    bgColor: "bg-[#F0D4D0]",
    products: [
      {
        image: "/product1.png",
        name: "Face Mist",
        price: "₹399.00",
      },
      {
        image: "/product2.png",
        name: "Lipstick",
        price: "₹399.00",
      },
      {
        image: "/product2.png",
        name: "Lipstick",
        price: "₹399.00",
      },
      {
        image: "/product1.png",
        name: "Lipstick",
        price: "₹399.00",
      },
    ],
  },

  {
    title: "Kitchen",
    subtitle: "Products",
    banner: "/category2.jpg",
    bgColor: "bg-[#E6DCCF]",
    products: [
      {
        image: "/kitchen1.png",
        name: "Wood Spoon",
        price: "₹399.00",
      },
      {
        image: "/kitchen1.png",
        name: "Mugs",
        price: "₹399.00",
      },
      {
        image: "/kitchen1.png",
        name: "Mugs",
        price: "₹399.00",
      },
      {
        image: "/kitchen2.png",
        name: "Mugs",
        price: "₹399.00",
      },
    ],
  },

  {
    title: "Powder",
    subtitle: "Products",
    banner: "/category3.png",
    bgColor: "bg-white",
    products: [
      {
        image: "/powder1.png",
        name: "Chilli Powder",
        price: "₹399.00",
      },
      {
        image: "/powder2.png",
        name: "Turmeric",
        price: "₹399.00",
      },
      {
        image: "/powder1.png",
        name: "Chilli Powder",
        price: "₹399.00",
      },
      {
        image: "/powder2.png",
        name: "Turmeric",
        price: "₹399.00",
      },
    ],
  },
];

const CategoryShowcase = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // TITLE REVEAL
      gsap.fromTo(
        ".category-title",
        {
          opacity: 0,
          y: 80,
        },
        {
          opacity: 1,
          y: 0,

          duration: 1.8,

          ease: "expo.out",

          scrollTrigger: {
            trigger: ".category-title",
            start: "top 88%",
          },
        }
      );

      // SMALL TITLE
      gsap.fromTo(
        ".title-small",
        {
          opacity: 0,
          y: 30,
          rotate: 2,
        },
        {
          opacity: 1,
          y: 0,
          rotate: 0,

          duration: 1.4,

          ease: "power3.out",

          scrollTrigger: {
            trigger: ".category-title",
            start: "top 88%",
          },
        }
      );

      // MAIN TITLE
      gsap.fromTo(
        ".title-main",
        {
          opacity: 0,
          y: 120,
          scale: 0.9,
          rotate: -2,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",

          duration: 2.2,

          ease: "expo.out",

          scrollTrigger: {
            trigger: ".category-title",
            start: "top 88%",
          },
        }
      );
      // CATEGORY REVEAL
      gsap.utils.toArray(".category-block").forEach((block) => {
        gsap.fromTo(
          block,
          {
            opacity: 0,
            y: 100,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 82%",
            },
          }
        );
      });

      // LUXURY PARALLAX
      gsap.utils.toArray(".parallax-wrapper").forEach((wrapper) => {
        const image = wrapper.querySelector(".parallax-image");

        gsap.fromTo(
          image,
          {
            yPercent: -10,
            scale: 1.12,
          },
          {
            yPercent: 10,
            scale: 1.02,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });

      // PREMIUM PRODUCT SCROLL
      gsap.utils.toArray(".product-grid").forEach((grid) => {

        const cards = grid.querySelectorAll(".product-card");

        // rail reveal
        gsap.fromTo(
          grid,
          {
            opacity: 0, y: 24,
          },
          {
            opacity: 1, y: 0, duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 92%",
            },
          }
        );

        // smooth product reveal
        gsap.fromTo(
          cards,
          {
            opacity: 0, y: 12, scale: 0.96,
          },
          {
            opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 88%",
            },
          }
        );

        // DRAG SCROLL WITH TILT EFFECT
        let isDown = false;
        let startX;
        let scrollLeft;
        let lastX;
        let lastTouchX;

        grid.addEventListener("mousedown", (e) => {
          isDown = true;
          grid.classList.add("cursor-grabbing");
          startX = e.pageX - grid.offsetLeft;
          lastX = e.pageX;
          scrollLeft = grid.scrollLeft;
        });

        grid.addEventListener("mouseleave", () => {
          isDown = false;
          grid.classList.remove("cursor-grabbing");
          gsap.to(cards, {
            rotate: 0,
            skewX: 0,
            x: 0,
            duration: 0.6,
            ease: "back.out(1.5)",
            overwrite: "auto",
          });
        });

        grid.addEventListener("mouseup", () => {
          isDown = false;
          grid.classList.remove("cursor-grabbing");
          gsap.to(cards, {
            rotate: 0,
            skewX: 0,
            x: 0,
            duration: 0.6,
            ease: "back.out(1.5)",
            overwrite: "auto",
          });
        });

        grid.addEventListener("mousemove", (e) => {
          if (!isDown) return;
          e.preventDefault();

          const x = e.pageX - grid.offsetLeft;
          const walk = (x - startX) * 1.8;
          grid.scrollLeft = scrollLeft - walk;

          const deltaX = e.pageX - lastX;
          lastX = e.pageX;

          let tiltAngle = deltaX * 0.6;
          tiltAngle = Math.max(-7, Math.min(7, tiltAngle));

          gsap.to(cards, {
            rotate: -tiltAngle,
            skewX: -tiltAngle * 0.4,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        // TOUCH SUPPORT FOR MOBILE DRAG & TILT
        grid.addEventListener("touchstart", (e) => {
          isDown = true;
          startX = e.touches[0].pageX - grid.offsetLeft;
          lastTouchX = e.touches[0].pageX;
          scrollLeft = grid.scrollLeft;
        }, { passive: true });

        grid.addEventListener("touchend", () => {
          isDown = false;
          gsap.to(cards, {
            rotate: 0,
            skewX: 0,
            x: 0,
            duration: 0.6,
            ease: "back.out(1.5)",
            overwrite: "auto",
          });
        });

        grid.addEventListener("touchmove", (e) => {
          if (!isDown) return;

          const x = e.touches[0].pageX - grid.offsetLeft;
          const deltaX = e.touches[0].pageX - lastTouchX;
          lastTouchX = e.touches[0].pageX;

          const walk = (x - startX) * 1.5;
          grid.scrollLeft = scrollLeft - walk;

          let tiltAngle = deltaX * 0.6;
          tiltAngle = Math.max(-7, Math.min(7, tiltAngle));

          gsap.to(cards, {
            rotate: -tiltAngle,
            skewX: -tiltAngle * 0.4,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }, { passive: true });

      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#f1f0ee] py-10 overflow-hidden"
    >

      {/* TITLE */}
      <div className="category-title mb-14 text-center flex flex-col items-center justify-center overflow-hidden">

        <p
          className="title-small text-[#2d3150] text-5xl font-serif tracking-wide leading-none -mb-3 z-10">
          Explore
        </p>

        <h2 className="title-main text-[#2d3150] text-6xl sm:text-7xl lg:text-8xl font-yellowtail leading-tight">
          Category
        </h2>

      </div>

      {/* CATEGORY LIST */}
      <div>

        {categories.map((category, index) => (
          <div
            key={index}
            className={`category-block grid grid-cols-1 lg:grid-cols-2 items-start gap-0
              ${index % 2 !== 0
                ? "lg:[&>*:first-child]:order-2"
                : ""
              }
            `}
          >

            {/* IMAGE SIDE */}
            <div className=" parallax-wrapper relative h-[420px] sm:h-[460px] lg:h-[690px] overflow-hidden">

              <div className="parallax-image absolute inset-0">

                <Image
                  src={category.banner}
                  alt={category.title}
                  fill
                  className="object-cover scale-110"
                />

              </div>

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

            </div>

            {/* CONTENT SIDE */}
            <div className={`flex flex-col justify-between my-auto w-full py-8 lg:py-0 ${index % 2 === 0 ? 'pl-5 sm:pl-7 lg:pl-14' : 'pr-5 sm:pr-7 lg:pr-14'}`}>

              {/* HEADER */}
              <div className={`flex items-start justify-between mb-2 ${index % 2 === 0 ? 'pr-5 sm:pr-7 lg:pr-14' : 'pl-5 sm:pl-7 lg:pl-14'}`}>

                <div>

                  <h3 className=" text-[#393F59] text-3xl sm:text-4xl lg:text-[2.5rem] leading-none font-DM_Serif_Display">
                    {category.title}
                  </h3>

                  <p className=" text-[#2d3150] font-yellowtail text-2xl lg:text-3xl leading-none mt-1">
                    {category.subtitle}
                  </p>

                </div>

                {/* BUTTON */}
                <button className=" w-11 h-11 rounded-full bg-[#2d3150] text-white flex items-center justify-center transition-all duration-300 hover:scale-105 ">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

              </div>

              {/* PRODUCT RAIL */}
              <div
                className={`product-grid flex gap-3 sm:gap-4 py-2 will-change-transform overflow-x-scroll overflow-y-visible no-scrollbar cursor-grab select-none ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}>

                {category.products.map((product, i) => (
                  <div
                    key={i}
                    className={`product-card group relative w-[150px] sm:w-[170px] lg:w-[240px] flex-shrink-0 rounded-[16px] ${category.bgColor || 'bg-[#F0D4D0]'} border border-black/[0.04] p-2 sm:p-4 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-500 ease-out hover:-translate-y-[2px]`}>

                    {/* TOP */}
                    <div className="mb-3 flex items-center justify-between">

                      <span className=" text-[8px] sm:text-[11px] bg-[#ffffff] px-2 py-[4px] rounded-full text-[#2d3150] tracking-wide">
                        PURE BRILLIANCE
                      </span>

                      {/* <span className="text-[#21232b] text-xl">
                        ⊕
                      </span> */}

                    </div>

                    {/* IMAGE */}
                    <div
                      className="relative h-[140px] sm:h-[170px] lg:h-[290px] mb-4 select-none pointer-events-none">

                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        draggable={false}
                        className="object-contain scale-[1.01] transition-all duration-700 ease-out group-hover:-translate-y-1 select-none pointer-events-none"
                      />

                    </div>

                    {/* INFO */}
                    <div>

                      <div className="flex items-center justify-between">

                        <p className="text-[#130D40] text-[12px] sm:text-[13px] md:text-base">
                          {product.name}
                        </p>

                        <p className="text-[#130D40] text-[12px] sm:text-[13px]">
                          {product.price}
                        </p>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

              {/* DESCRIPTION */}
              <p className="mt-5 text-[#767676] text-sm max-w-sm uppercase tracking-wide ">
                STAY GLOWING AND HEALTHY WITHOUT
                HAVING TO THINK ABOUT IT.
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
};

export default CategoryShowcase;