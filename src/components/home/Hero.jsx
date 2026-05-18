"use client";

import Image from "next/image";
import Navbar from "../Navbar";

const Hero = () => {
    return (
        <section className="relative w-full h-screen overflow-hidden">

            {/* Navbar */}
            <Navbar />

            {/* Hero Image */}
            <div className="relative w-full h-full">

                <Image
                    src="/heroo.png"
                    alt="Hero"
                    fill
                    priority
                    className="object-cover "
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/20" />

            </div>

        </section>
    );
};

export default Hero;