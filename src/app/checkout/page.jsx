"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkoutQuoteApi, createOrderApi } from "@/services/checkoutApi";
import { getCartApi } from "@/services/cartApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [cartItems, setCartItems] = useState([]);
  const [quote, setQuote] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [billingAddress, setBillingAddress] = useState({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    setLoading(true);
    try {
      const cartRes = await getCartApi();
      if (cartRes && cartRes.status === 200) {
        setCartItems(cartRes.data.data?.items || cartRes.data?.items || []);
      }
      
      const quoteRes = await checkoutQuoteApi({});
      if (quoteRes && quoteRes.status === 200) {
        setQuote(quoteRes.data.data || quoteRes.data);
      } else {
        setError("Failed to load checkout details. Cart might be empty.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred loading the checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        guest_email: contactInfo.email,
        guest_phone: contactInfo.phone,
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        payment_method: paymentMethod, // currently informational on backend unless passed to notes
        notes: `Payment Method: ${paymentMethod}`
      };

      const response = await createOrderApi(payload);
      
      if (response && (response.status === 200 || response.status === 201)) {
        const orderId = response.data?.data?.order_number || response.data?.order_number || response.data?.data?.id || response.data?.id;
        
        // Dispatch cart update to clear cart in UI
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cartUpdated"));
        }
        
        router.push(`/order-success/${orderId}`);
      } else {
        setError(response?.data?.message || "Failed to create order. Please check your details.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFAF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#2C332E]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF7] font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-[#2C332E] mb-8">Checkout</h1>
        
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form Section */}
          <div className="lg:w-2/3 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-xl border border-[#E6E4DD] shadow-sm">
                <h2 className="text-xl font-bold text-[#2C332E] mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Email *</label>
                    <input 
                      type="email" 
                      required
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Phone</label>
                    <input 
                      type="tel" 
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-xl border border-[#E6E4DD] shadow-sm">
                <h2 className="text-xl font-bold text-[#2C332E] mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Full Name *</label>
                    <input type="text" name="full_name" required value={shippingAddress.full_name} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Address Line 1 *</label>
                    <input type="text" name="line1" required value={shippingAddress.line1} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Address Line 2 (Optional)</label>
                    <input type="text" name="line2" value={shippingAddress.line2} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">City *</label>
                    <input type="text" name="city" required value={shippingAddress.city} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">State *</label>
                    <input type="text" name="state" required value={shippingAddress.state} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Postal Code *</label>
                    <input type="text" name="postal_code" required value={shippingAddress.postal_code} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Country *</label>
                    <input type="text" name="country" required value={shippingAddress.country} onChange={handleShippingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                  </div>
                </div>
              </div>

              {/* Billing Address Toggle */}
              <div className="bg-white p-6 rounded-xl border border-[#E6E4DD] shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-5 h-5 text-[#2C332E] border-[#E6E4DD] rounded focus:ring-[#2C332E]"
                  />
                  <span className="text-sm font-bold text-[#2C332E]">Billing address same as shipping</span>
                </label>
              </div>

              {/* Billing Address Form (if different) */}
              {!sameAsShipping && (
                <div className="bg-white p-6 rounded-xl border border-[#E6E4DD] shadow-sm">
                  <h2 className="text-xl font-bold text-[#2C332E] mb-4">Billing Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Full Name *</label>
                      <input type="text" name="full_name" required value={billingAddress.full_name} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Address Line 1 *</label>
                      <input type="text" name="line1" required value={billingAddress.line1} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Address Line 2 (Optional)</label>
                      <input type="text" name="line2" value={billingAddress.line2} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">City *</label>
                      <input type="text" name="city" required value={billingAddress.city} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">State *</label>
                      <input type="text" name="state" required value={billingAddress.state} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Postal Code *</label>
                      <input type="text" name="postal_code" required value={billingAddress.postal_code} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5A635B] uppercase tracking-wider mb-1">Country *</label>
                      <input type="text" name="country" required value={billingAddress.country} onChange={handleBillingChange} className="w-full px-4 py-2 border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] bg-[#FCFAF7]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="bg-white p-6 rounded-xl border border-[#E6E4DD] shadow-sm">
                <h2 className="text-xl font-bold text-[#2C332E] mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'RAZORPAY' ? 'border-[#2C332E] bg-[#F5F4F0]' : 'border-[#E6E4DD] hover:bg-[#F5F4F0]'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="RAZORPAY" 
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="w-4 h-4 text-[#2C332E]"
                    />
                    <div>
                      <p className="font-bold text-[#2C332E] text-sm">Pay online securely via Razorpay</p>
                      <p className="text-xs text-[#5A635B] mt-1">UPI, Credit/Debit Cards, NetBanking</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#2C332E] bg-[#F5F4F0]' : 'border-[#E6E4DD] hover:bg-[#F5F4F0]'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="w-4 h-4 text-[#2C332E]"
                    />
                    <div>
                      <p className="font-bold text-[#2C332E] text-sm">Cash on Delivery (COD)</p>
                      <p className="text-xs text-[#5A635B] mt-1">Pay with cash upon delivery</p>
                    </div>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl border border-[#E6E4DD] shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-[#2C332E] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#F5F4F0] rounded-md border border-[#E6E4DD] overflow-hidden flex-shrink-0">
                       {item.variant?.primary_image || item.product?.primary_image ? (
                          <img src={item.variant?.primary_image || item.product?.primary_image} alt={item.product?.name} className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                       )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-[#2C332E] line-clamp-1">{item.product?.name}</h4>
                      {item.variant && <p className="text-[11px] text-[#7B827C]">{item.variant.name}</p>}
                      <div className="flex justify-between mt-1 items-center">
                        <span className="text-xs text-[#5A635B]">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-[#2C332E]">₹{item.line_total || (parseFloat(item.current_price) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E6E4DD] pt-4 space-y-3">
                <div className="flex justify-between text-sm text-[#5A635B]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2C332E]">₹{quote?.subtotal || "0.00"}</span>
                </div>
                {quote && parseFloat(quote.discount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{quote.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#5A635B]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#2C332E]">
                    {parseFloat(quote?.shipping_amount) === 0 ? "Free" : `₹${quote?.shipping_amount || "0.00"}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-[#5A635B]">
                  <span>Tax</span>
                  <span className="font-medium text-[#2C332E]">₹{quote?.tax_amount || "0.00"}</span>
                </div>
              </div>
              
              <div className="border-t border-[#E6E4DD] pt-4 mt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-[#2C332E]">Total</span>
                <span className="text-xl font-bold text-[#2C332E]">₹{quote?.grand_total || "0.00"}</span>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={submitting || cartItems.length === 0}
                className="w-full mt-6 py-4 bg-[#2C332E] text-white text-sm font-bold rounded-xl hover:bg-[#3E4741] transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-70"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Confirm Order"}
              </button>
              
              <p className="text-[10px] text-center text-[#7B827C] mt-3">
                By placing your order, you agree to our Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
