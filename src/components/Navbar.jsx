"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { logoutApi } from "@/services/auth";
import ProfileDrawer from "./ProfileDrawer";
import CartDrawer from "./CartDrawer";
import NotificationModal from "./NotificationModal";
import WishlistDrawer from "./WishlistDrawer";

const Navbar = ({ theme = "dark" }) => {
  const isDark = theme === "dark";
  const isWhite = theme === "white";
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const storedUser = localStorage.getItem("customerUser");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage events (e.g., login/logout changes)
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("openCart", handleOpenCart);
    return () => window.removeEventListener("openCart", handleOpenCart);
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (e) => {
      if (!e.target.closest("#user-menu-button") && !e.target.closest("#user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("customerRefreshToken") || localStorage.getItem("adminRefreshToken");
    try {
      if (refreshToken) {
        await logoutApi({ refresh: refreshToken });
      }
    } catch (e) {
      console.error("Logout API call failed:", e);
    } finally {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
      localStorage.removeItem("customerRefreshToken");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminRefreshToken");
      setUser(null);
      setIsDropdownOpen(false);
      window.location.reload();
    }
  };

  // Dynamic classes for text and background
  const textColorClass = isScrolled ? "text-[#353B50]" : (isDark ? "text-white" : (isWhite ? "text-[#393F59]" : "text-black"));
  const bgClass = isScrolled ? "bg-[#F2F2F2]/95 backdrop-blur-md shadow-sm" : "bg-transparent";

  return (
    <>
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
              <Link href="/about-us" className="hover:opacity-80 transition-opacity">About Us</Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">Blog</Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">Contact</Link>
            </nav>

            {/* Icons */}
            <div className={`flex items-center gap-5 ${textColorClass} transition-colors duration-500`}>
              <button className="hover:scale-105 transition-transform">
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button onClick={() => setIsCartOpen(true)} className="hover:scale-105 transition-transform flex items-center justify-center p-1">
                <ShoppingBag size={18} strokeWidth={1.5} />
              </button>
              <div className="relative">
                <button
                  id="user-menu-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hover:scale-105 transition-transform flex items-center justify-center p-1"
                >
                  <User size={18} strokeWidth={1.5} />
                </button>

                {isDropdownOpen && (
                  <div
                    id="user-dropdown"
                    className={`absolute right-0 mt-3 w-56 rounded-2xl p-4 shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${isScrolled || isWhite || theme === "light"
                        ? "bg-white/95 border-slate-200/60 text-[#353B50]"
                        : "bg-[#1E293B]/95 border-slate-800 text-white"
                      }`}
                  >
                    {user ? (
                      <div className="space-y-0 text-left px-1 py-1">
                        <Link
                          href="/account?tab=orders"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between w-full py-3 text-[13px] font-medium text-[#353B50] hover:text-black transition-colors border-b border-slate-200"
                        >
                          <span>My Orders</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </Link>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsWishlistOpen(true);
                          }}
                          className="flex items-center justify-between w-full py-3 text-[13px] font-medium text-[#353B50] hover:text-black transition-colors border-b border-slate-200"
                        >
                          <span>Wish List</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsNotificationOpen(true);
                          }}
                          className="flex items-center justify-between w-full py-3 text-[13px] font-medium text-[#353B50] hover:text-black transition-colors border-b border-slate-200"
                        >
                          <span>Notifications</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsCartOpen(true);
                          }}
                          className="flex items-center justify-between w-full py-3 text-[13px] font-medium text-[#353B50] hover:text-black transition-colors border-b border-slate-200"
                        >
                          <span>My Cart</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <Link
                          href="/account"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between w-full py-3 text-[13px] font-medium text-[#353B50] hover:text-black transition-colors border-b border-slate-200"
                        >
                          <span>My Account</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </Link>

                        <div className="pt-6 pb-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-center text-[10px] font-bold text-[#f8f9fa] bg-[#9A353B] hover:bg-[#852C31] rounded-3xl py-2.5 transition-colors uppercase tracking-widest shadow-sm"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-left">
                        <div className={`border-b pb-2 ${isScrolled || isWhite || theme === "light" ? "border-slate-100" : "border-slate-800"}`}>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                            Welcome to Lumora
                          </p>
                        </div>
                        <Link
                          href="/login"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`block text-center py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${isScrolled || isWhite || theme === "light"
                              ? "bg-[#353B50] text-white hover:bg-[#434b66]"
                              : "bg-white text-slate-900 hover:bg-slate-100"
                            }`}
                        >
                          Sign In
                        </Link>
                        <div className="text-center pt-1">
                          <Link
                            href="/register"
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-[11px] font-bold hover:underline opacity-85"
                          >
                            Create an Account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Notification Modal */}
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

      {/* Wishlist Drawer */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Navbar;
