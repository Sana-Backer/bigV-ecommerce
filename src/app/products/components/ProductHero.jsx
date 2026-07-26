"use client";

import Image from "next/image";

const ProductHero = () => {
  return (
    <>
      {/* HERO SECTION */}
      {/* <section className="sticky top-0 h-screen w-full z-0 overflow-hidden"> */}
      <section className="sticky top-0 h-[400px] md:h-[450px] w-full overflow-hidden">

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
