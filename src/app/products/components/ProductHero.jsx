"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";

const ProductHero = () => {
  return (
    <>
      {/* HERO SECTION */}
      <section className="sticky top-0 h-screen w-[100vw] -z-10 overflow-hidden">

        {/* Navbar */}
        <Navbar />

        {/* Hero Image */}
        <div className="relative w-full h-full">

          <Image
            src="/product-hero.png"
            alt="Product Hero"
            fill
            priority
            className="object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />

        </div>

      </section>
    </>
  );
};

export default ProductHero;
