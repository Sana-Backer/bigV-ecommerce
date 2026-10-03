"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Mail } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    honeypot: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Field Validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (formData.phone && formData.phone.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      toast.error("Message must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending message...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!", { id: loadingToast });
        setFormData({ name: "", email: "", phone: "", message: "", honeypot: "" });
      } else {
        toast.error(data.error || "Failed to send message.", { id: loadingToast });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An unexpected error occurred. Please try again.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="relative min-h-screen w-full flex flex-col">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 h-[120vh]">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image
            src="/contact-bg.png"
            alt="Contact Background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Navbar Layer */}
        <div className="relative z-50">
          <Navbar />
        </div>

        {/* Main Content Layer */}
        <div className="relative z-20 flex-1 flex items-center pt-24 pb-20">
          <div className="container mx-auto px-6 lg:px-12 w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* Left Column: Text & Info */}
              <div className="text-white space-y-10">
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-bold tracking-wider uppercase text-white/90">
                    Contact Us
                  </h3>
                  <h1 className="text-5xl md:text-7xl font-light tracking-tight flex flex-wrap items-baseline gap-4">
                    <span>Get in</span>
                    <span 
                      style={{ fontFamily: "var(--font-yellowtail)" }}
                      className="text-6xl md:text-8xl lowercase -translate-y-2 inline-block"
                    >
                      touch
                    </span>
                  </h1>
                  <p className="text-xs md:text-sm max-w-md uppercase tracking-wider leading-relaxed text-white/80 mt-6">
                    Receive expert guidance to maximize your next purchase, sale, or investment.
                  </p>
                </div>

                <div className="space-y-6 pt-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-slate-800" />
                    </div>
                    <span className="font-bold text-sm md:text-base">123 New South, New York</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-slate-800" />
                    </div>
                    <span className="font-bold text-sm md:text-base">Contact@Asdf.Com</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="w-full max-w-md ml-auto">
                <div className="bg-white rounded-xl p-8 shadow-2xl">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Honeypot field - hidden from users, catches bots */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="honeypot">Leave this field blank</label>
                      <input 
                        type="text" 
                        name="honeypot" 
                        id="honeypot"
                        tabIndex="-1"
                        autoComplete="off"
                        value={formData.honeypot}
                        onChange={(e) => setFormData({...formData, honeypot: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2C3B5E]">Name*</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#F5F5F5] text-slate-800 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2C3B5E]">Email*</label>
                      <input 
                        type="email" 
                        required
                        placeholder="your email address"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-[#F5F5F5] text-slate-800 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2C3B5E]">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-[#F5F5F5] text-slate-800 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2C3B5E]">Message*</label>
                      <textarea 
                        required
                        placeholder="your message here..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-[#F5F5F5] text-slate-800 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all resize-none placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3B4256] hover:bg-[#2C3B5E] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors mt-2 text-sm tracking-wide shadow-md flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? "Sending..." : "Submit"}
                    </button>

                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <div className="relative z-20 bg-white pt-24">
         <Footer />
      </div>
    </>
  );
}
