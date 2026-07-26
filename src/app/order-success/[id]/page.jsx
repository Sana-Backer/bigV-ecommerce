"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Package, Home, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { commonAPI } from "@/services/commonAPI";
import { api } from "@/services/serverUrl";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF7] font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full">
        <div className="bg-white p-10 md:p-14 rounded-2xl border border-[#E6E4DD] shadow-lg w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#2C332E]"></div>
          
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          
          <h1 className="text-4xl font-serif text-[#2C332E] mb-2">Thank You!</h1>
          <p className="text-[#5A635B] mb-8 text-lg">Your order has been successfully placed.</p>
          
          <div className="bg-[#FCFAF7] border border-[#E6E4DD] rounded-xl p-6 mb-10 text-left">
            <h2 className="text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-4 border-b border-[#E6E4DD] pb-2">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#7B827C] flex items-center gap-1"><Package size={12}/> Order Number</span>
                <span className="font-bold text-[#2C332E] text-base">{id}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#7B827C] flex items-center gap-1"><Calendar size={12}/> Date</span>
                <span className="font-bold text-[#2C332E] text-base">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#7B827C] flex items-center gap-1"><CheckCircle2 size={12}/> Status</span>
                <span className="font-bold text-emerald-600 text-base">Confirmed</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="w-full sm:w-auto px-8 py-3 bg-[#2C332E] text-white text-sm font-bold rounded-xl hover:bg-[#3E4741] transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-widest"
            >
              <Home size={16} /> Return to Home
            </Link>
            <Link 
              href="/products"
              className="w-full sm:w-auto px-8 py-3 bg-white border border-[#E6E4DD] text-[#2C332E] text-sm font-bold rounded-xl hover:bg-[#FCFAF7] transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-widest"
            >
              Continue Shopping <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
