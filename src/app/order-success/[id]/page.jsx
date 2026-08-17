"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Package, Home, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { commonAPI } from "@/services/commonAPI";
import { api } from "@/services/serverUrl";
import { getMyOrderByNumberApi } from "@/services/ordersApi";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          const res = await getMyOrderByNumberApi(id);
          if (res.status === 200 || res.status === 201) {
            setOrderDetail(res.data?.data || res.data);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id]);
  
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
                <span className="font-bold text-[#2C332E] text-base">{orderDetail?.created_at ? new Date(orderDetail.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#7B827C] flex items-center gap-1"><CheckCircle2 size={12}/> Status</span>
                <span className="font-bold text-emerald-600 text-base">{orderDetail?.status ? orderDetail.status.charAt(0).toUpperCase() + orderDetail.status.slice(1).toLowerCase() : 'Confirmed'}</span>
              </div>
            </div>
          </div>
          
          {/* Products Ordered Section */}
          {!loading && orderDetail && orderDetail.items && orderDetail.items.length > 0 && (
            <div className="bg-[#FCFAF7] border border-[#E6E4DD] rounded-xl p-6 mb-10 text-left">
              <h2 className="text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-4 border-b border-[#E6E4DD] pb-2">Products Ordered</h2>
              <div className="space-y-4">
                {orderDetail.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-[#E6E4DD] pb-4 last:border-0 last:pb-0 gap-4">
                    <div className="flex gap-4 items-center">
                      {item.image && (
                        <div className="w-16 h-16 rounded bg-gray-100 flex-shrink-0 relative overflow-hidden">
                          <img src={item.image} alt={item.product_name} className="object-cover w-full h-full" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[#2C332E]">{item.product_name}</p>
                        {item.variant_name && <p className="text-xs text-[#7B827C]">Variant: {item.variant_name}</p>}
                        <p className="text-xs text-[#7B827C]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-[#2C332E]">₹{parseFloat(item.total_price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#E6E4DD] flex justify-between items-center">
                <span className="font-bold text-[#5A635B]">Total</span>
                <span className="font-bold text-[#2C332E] text-lg">₹{parseFloat(orderDetail.total_amount).toFixed(2)}</span>
              </div>
            </div>
          )}
          
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
