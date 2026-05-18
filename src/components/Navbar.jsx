"use client";

import { Search, ShoppingBag, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <h1 className="text-white text-3xl font-semibold tracking-[0.3em]">
            LUMORA
          </h1>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-10 text-white text-sm">
            <a href="#">Shop</a>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5 text-white">
            <Search size={18} strokeWidth={1.5} />
            <ShoppingBag size={18} strokeWidth={1.5} />
            <User size={18} strokeWidth={1.5} />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;