"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    title: "Amazing Results With Face Cream",
    description:
      "I've struggled with dull skin for years, but after using this product, my complexion has transformed. It's like a glow in a bottle! Highly recommend for anyone seeking radiance.",
    name: "Sophia M.",
    image: "/testimonial-1.png",
  },

  {
    title: "Natural Ingredients, Great Results",
    description:
      "Knowing that this product is made with natural ingredients makes me trust it even more. The results speak for themselves—smoother skin and fewer blemishes in just a few weeks!",
    name: "Emily R.",
    image: "/testimonial-2.png",
  },

  {
    title: "Perfect For All Seasons, I Love It",
    description:
      "I've been using this product for six months, and it’s perfect for all seasons. It keeps my skin moisturized in winter and oil-free in summer. Truly versatile!",
    name: "Perry Wilson",
    image: "/testimonial-1.png",
  },
];

const Testimonials = () => {

  const sectionRef = useRef(null);

  useEffect(() => {

    const ctx = gsap.context(() => {

      gsap.fromTo(
        ".testimonial-title",
        {
          y: 120,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,

          duration: 1.2,

          ease: "power4.out",

          scrollTrigger: {
            trigger: ".testimonial-title",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".testimonial-card",
        {
          y: 60,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,

          stagger: 0.15,

          duration: 1,

          ease: "power3.out",

          scrollTrigger: {
            trigger: ".testimonial-grid",
            start: "top 82%",
          },
        }
      );

      gsap.fromTo(
        ".testimonial-image",
        {
          scale: 1.08,
          y: 40,
        },
        {
          scale: 1,
          y: -40,

          ease: "none",

          scrollTrigger: {
            trigger: ".testimonial-image-wrapper",
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();

  }, []);

  return (
    <section
      ref={sectionRef}
      className=" py-2 lg:py-3 overflow-hidden"
    >

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">

        {/* TITLE */}
        <div className="overflow-hidden mb-14">

          <h2
            className="
              testimonial-title

              text-[#2d3150]

              text-5xl
              sm:text-6xl
              lg:text-7xl

              leading-none

              font-dm-serif
            "
          >
            Testimonials
          </h2>

        </div>

        {/* GRID */}
        <div className="testimonial-grid grid lg:grid-cols-2 gap-8 items-start">

          {/* LEFT */}
          <div className="flex flex-col gap-6">

            {testimonials.slice(0, 2).map((item, index) => (

              <div
                key={index}
                className="
                  testimonial-card

                  bg-[#f7f7f7]

                  border
                  border-[#dfdbd6]

                  shadow-[0_4px_20px_rgba(0,0,0,0.04)]

                  p-8
                  lg:p-6
                "
              >

                {/* STARS */}
                <div className="flex gap-1 mb-1 text-black text-[13px]">

                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}

                </div>

                {/* TITLE */}
                <h3
                  className="
                    text-[#1d1d1d]

                    text-2xl
                    lg:text-xl

                   

                    font-semibold

                    mb-2
                  "
                >
                  “{item.title}”
                </h3>

                {/* DESC */}
                <p className="text-[#767676] text-sm mb-4">
                  "{item.description}"
                </p>

                {/* USER */}
                <div className="flex items-center gap-2">

                  <div
                    className="
                      relative

                      w-10
                      h-10

                      rounded-full

                      overflow-hidden
                    "
                  >

                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />

                  </div>

                  <p className="text-[#1d1d1d] text-md font-medium">
                    {item.name}
                  </p>

                </div>

              </div>

            ))}

          </div>
{/* RIGHT */}
<div className="relative lg:pt-0 pt-2">

  {/* IMAGE */}
  <div
    className="
      testimonial-image-wrapper

      relative

      overflow-hidden
    "
  >

    <div
      className="
        testimonial-image

        relative

        w-full

        h-[300px]
        sm:h-[380px]
        lg:h-[400px]
      "
    >

      <Image
        src="/testimonial.jpg"
        alt="Beauty Product"
        fill
        className="object-cover"
      />

    </div>

  </div>

  {/* FLOATING CARD */}
  <div
    className="
      testimonial-card

      relative
      lg:absolute

      lg:-bottom-8
      

      mt-4
      lg:mt-0

      bg-[#f7f7f7]

      border
      border-[#dfdbd6]

      shadow-[0_4px_20px_rgba(0,0,0,0.04)]

      p-6
      lg:p-3

      w-full
      lg:max-w-[72%]
    "
  >

    {/* STARS */}
    <div className="flex gap-1  text-black text-md">

      {[...Array(5)].map((_, i) => (
        <span key={i}>★</span>
      ))}

    </div>

    {/* TITLE */}
    <h3
      className="
        text-[#1d1d1d]

        text-xl
        lg:text-lg


        font-semibold
        mb-2
      "
    >
      “{testimonials[2].title}”
    </h3>

    {/* DESC */}
    <p
      className="
        text-[#767676]

        text-sm
        lg:text-sm mb-2 
      "
    >
      "{testimonials[2].description}"
    </p>

    {/* USER */}
    <div className="flex items-center gap-3">

      <div
        className="
          relative

          w-10
          h-10

          rounded-full

          overflow-hidden
        "
      >

        <Image
          src={testimonials[2].image}
          alt={testimonials[2].name}
          fill
          className="object-cover"
        />

      </div>

      <p className="text-[#1d1d1d] text-sm font-medium">
        {testimonials[2].name}
      </p>

    </div>

  </div>

</div>
        </div>

      </div>

    </section>
  );
};

export default Testimonials;