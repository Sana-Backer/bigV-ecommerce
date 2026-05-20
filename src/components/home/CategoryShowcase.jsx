"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    title: "Beauty",
    subtitle: "Products",
    banner: "/category1.jpg",
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
      
    ],
  },

  {
    title: "Kitchen",
    subtitle: "Products",
    banner: "/category2.jpg",
    products: [
      {
        image: "/kitchen1.png",
        name: "Wood Spoon",
        price: "₹399.00",
      },
      {
        image: "/kitchen2.png",
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
    ],
  },
];

const CategoryShowcase = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // CATEGORY REVEAL
      gsap.utils.toArray(".category-block").forEach((block) => {
        gsap.fromTo(
          block,
          {
            opacity: 0,
            y: 120,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 80%",
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
            yPercent: -22,
            scale: 1.28,
            opacity: 0.82,
          },
          {
            yPercent: 22,
            scale: 1.05,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          }
        );
      });

// PRODUCT RAIL MOTION
gsap.utils.toArray(".product-grid").forEach((grid, index) => {

  const direction = index % 2 === 0 ? 50 : -50;

  gsap.to(grid, {
    x: direction,

    ease: "none",

    scrollTrigger: {
      trigger: grid,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.5,
    },
  });

});

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // MAGNETIC HOVER
  const handleMove = (e) => {
    const card = e.currentTarget;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.right;
    const y = e.clientY - rect.bottom;

    const moveX = (x - rect.width / 2) / 10;
    const moveY = (y - rect.height / 2) / 18;

    gsap.to(card, {
      x: moveX,
      y: moveY,
      rotate: moveX * 0.04,
      duration: 0.22,
      ease: "power3.out",
    });
  };

  const handleLeave = (e) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      rotate: 0,
      duration: 0.22,
      ease: "elastic.out(1,0.4)",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="bg-[#f1f0ee] py-10 overflow-hidden"
    >

      {/* TITLE */}
      <div className="mb-20 text-center">

        <p className="text-[#2d3150] text-2xl italic">
          Explore
        </p>

        <h2 className="text-[#2d3150] text-5xl font-bold">
          Category
        </h2>

      </div>

      {/* CATEGORY LIST */}
      <div className="">

        {categories.map((category, index) => (
          <div
            key={index}
            className={`
              category-block
              grid
              grid-cols-1
              lg:grid-cols-2
              items-center

              ${index % 2 !== 0
                ? "lg:[&>*:first-child]:order-2"
                : ""
              }
            `}
          >

            {/* IMAGE SIDE */}
            <div className="parallax-wrapper relative h-[520px] overflow-hidden rounded-[1px]">

              <div className="parallax-image absolute inset-0">

                <Image
                  src={category.banner}
                  alt={category.title}
                  fill
                  className="
                    object-cover
                    scale-110
                    transition-transform
                    duration-1000
                    
                  "
                />

              </div>

              {/* OVERLAY */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/10
                  via-transparent
                  to-transparent
                  pointer-events-none
                "
              />

            </div>

            {/* CONTENT SIDE */}
            <div>

              {/* HEADER */}
              <div className="flex items-start justify-between mb-10">

                <div>

                  <h3 className="text-[#2d3150] text-5xl font-bold leading-none">
                    {category.title}
                  </h3>

                  <p className="italic text-[#2d3150]">
                    {category.subtitle}
                  </p>

                </div>

                {/* BUTTON */}
                <button
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-[#2d3150]
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:scale-110
                    transition-all
                    duration-300
                  "
                >
                  →
                </button>

              </div>

              {/* PRODUCT GRID */}
              {/* PRODUCT RAIL */}
<div
  className="
    product-grid
    flex
    gap-4
    items-stretch
    will-change-transform
    py-2
    overflow-visible
  "
>

  {category.products.map((product, i) => (
    <div
      key={i}
      className="
        group
        product-card
        relative

        w-[220px]
        sm:w-[230px]
        md:w-[240px]
        lg:w-[250px]

        flex-shrink-0

        overflow-hidden

        rounded-[20px]

        bg-[#f7dede]/90
        backdrop-blur-md

        border
        border-black/[0.04]

        p-5

        transition-all
        duration-500
        ease-out

        hover:-translate-y-[2px]
        hover:shadow-[0_30px_80px_rgba(0,0,0,0.06)]

        will-change-transform
      "
    >

      {/* TOP */}
      <div className="mb-5 flex items-center justify-between">

        <span
          className="
            text-[10px]
            border
            border-[#2d3150]
            px-3
            py-[6px]
            rounded-full
            text-[#2d3150]
            tracking-wide
          "
        >
          PURE BRILLIANCE
        </span>

        <span className="text-[#2d3150] text-sm">
          ⊕
        </span>

      </div>

      {/* IMAGE */}
      <div
        className="
          relative
          h-[250px]
          overflow-hidden
          rounded-[18px]
          mb-6
        "
      >

        <Image
          src={product.image}
          alt={product.name}
          fill
          className="
            object-contain

            scale-[1.01]

            transition-transform
            duration-700
            ease-out

            group-hover:scale-[1.035]
          "
        />

      </div>

      {/* PRODUCT INFO */}
      <div className="space-y-2">

        <div className="flex items-center justify-between">

          <p className="text-[#2d3150] text-[15px]">
            {product.name}
          </p>

          <p className="text-[#2d3150] text-[15px] font-medium">
            {product.price}
          </p>

        </div>

        <p
          className="
            text-[#2d3150]/60
            text-[11px]
            uppercase
            tracking-[0.14em]
          "
        >
          Clean beauty essentials
        </p>

      </div>

    </div>
  ))}

</div>

              {/* DESCRIPTION */}
              <p
                className="
                  mt-6
                  text-[#2d3150]
                  text-sm
                  max-w-[420px]
                  uppercase
                  tracking-wide
                "
              >
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