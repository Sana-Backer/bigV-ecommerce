"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

const Navbar = ({ theme = "dark" }) => {
  const isDark = theme === "dark";
  const textColorClass = isDark ? "text-white" : "text-[#2d3150]";
  
  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/">
            <h1 className={`${textColorClass} text-3xl font-semibold tracking-[0.3em] cursor-pointer hover:opacity-80 transition-opacity`}>
              LUMORA
            </h1>
          </Link>

          {/* Nav Links */}
          <nav className={`hidden md:flex items-center gap-10 ${textColorClass} text-sm font-medium`}>
            <Link href="/products" className="hover:opacity-80 transition-opacity">Shop</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">About Us</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Blog</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Contact</Link>
          </nav>

          {/* Icons */}
          <div className={`flex items-center gap-5 ${textColorClass}`}>
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