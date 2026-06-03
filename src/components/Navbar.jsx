"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

const Navbar = ({ theme = "dark" }) => {
  const isDark = theme === "dark";
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Handle hiding/showing based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true);  // scrolling up
      }

      // Handle background styling when scrolled past the top
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Dynamic classes for text and background
  const textColorClass = isScrolled ? "text-[#353B50]" : (isDark ? "text-white" : "text-[#353B50]");
  const bgClass = isScrolled ? "bg-[#F2F2F2]/95 backdrop-blur-md shadow-sm" : "bg-transparent";

  return (
    <header 
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${bgClass} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>

          {/* Logo */}
          <Link href="/">
            <h1 className={`${textColorClass} text-3xl font-semibold tracking-[0.3em] cursor-pointer hover:opacity-80 transition-all duration-500`}>
              LUMORA
            </h1>
          </Link>

          {/* Nav Links */}
          <nav className={`hidden md:flex items-center gap-10 ${textColorClass} text-sm font-medium transition-colors duration-500`}>
            <Link href="/products" className="hover:opacity-80 transition-opacity">Shop</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">About Us</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Blog</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Contact</Link>
          </nav>

          {/* Icons */}
          <div className={`flex items-center gap-5 ${textColorClass} transition-colors duration-500`}>
            <button className="hover:scale-105 transition-transform">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button className="hover:scale-105 transition-transform">
              <ShoppingBag size={18} strokeWidth={1.5} />
            </button>
            <button className="hover:scale-105 transition-transform">
              <User size={18} strokeWidth={1.5} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
