"use client";

import React, { useState, useEffect } from "react";
import { getMyOrdersApi, getMyOrderDetailApi, cancelMyOrderApi } from "@/services/ordersApi";
import { Loader2, Package, ChevronRight, X, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrdersApi();
      if (res && res.status === 200) {
        const fetchedOrders = (res.data?.data || res.data?.results || []).map(o => {
          const d = new Date(o.created_at);
          return {
            id: o.order_number,
            realId: o.id,
            status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase() : "Pending",
            payment: o.payment_status ? o.payment_status.toLowerCase() : "pending",
            fulfillment: o.fulfillment_status ? o.fulfillment_status.charAt(0).toUpperCase() + o.fulfillment_status.slice(1).toLowerCase() : "Unfulfilled",
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            total: parseFloat(o.total_amount) || 0,
            itemCount: o.item_count || 0,
          };
        });
        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    setModalLoading(true);
    setIsModalOpen(true);
    setCancelError("");
    try {
      const res = await getMyOrderDetailApi(orderId);
      if (res && res.status === 200) {
        const data = res.data?.data || res.data;
        const d = new Date(data.created_at);
        
        // Format Items
        let products = [];
        if (data.items && data.items.length > 0) {
          products = data.items.map(item => {
            let itemName = item.product_name || "Unknown Product";
            if (item.variant_name) itemName += ` - ${item.variant_name}`;
            return {
              id: item.id,
              name: itemName,
              image: "/product1.png",
              price: parseFloat(item.unit_price) || 0,
              quantity: item.quantity || 1
            };
          });
        }

        // Format Address
        const formatAddress = (addr) => {
          if (addr && typeof addr === 'object') {
            const parts = [
              addr.full_name,
              addr.line1 || addr.street_address_1,
              addr.line2 || addr.street_address_2,
              addr.city,
              addr.state,
              addr.postal_code || addr.pin_code,
              addr.country
            ].filter(p => p && p.trim() !== '');
            return parts.length > 0 ? parts.join(", ") : "Address not provided";
          }
          return "Address not provided";
        };

        let paymentMethod = "N/A";
        if (data.notes && data.notes.includes("Payment Method:")) {
          paymentMethod = data.notes.split("Payment Method:")[1].trim();
        } else if (data.notes) {
          paymentMethod = data.notes;
        }

        setSelectedOrder({
          id: data.order_number,
          realId: data.id,
          status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase() : "Pending",
          payment: data.payment_status ? data.payment_status.toLowerCase() : "pending",
          fulfillment: data.fulfillment_status ? data.fulfillment_status.charAt(0).toUpperCase() + data.fulfillment_status.slice(1).toLowerCase() : "Unfulfilled",
          date: d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          total: parseFloat(data.total_amount) || 0,
          subtotal: parseFloat(data.subtotal) || 0,
          shippingAmount: parseFloat(data.shipping_amount) || 0,
          discountAmount: parseFloat(data.discount_amount) || 0,
          taxAmount: parseFloat(data.tax_amount) || 0,
          shippingAddress: formatAddress(data.shipping_address_snapshot),
          paymentMethod: paymentMethod,
          isCancellable: data.is_cancellable,
          products: products,
          history: data.status_history || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !selectedOrder.realId) return;
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;

    setCancelling(true);
    setCancelError("");
    try {
      const res = await cancelMyOrderApi(selectedOrder.realId, { reason: "Cancelled by customer via portal" });
      if (res && res.status === 200) {
        // Refresh orders list
        fetchOrders();
        // Update modal state
        setSelectedOrder(prev => ({
          ...prev,
          status: "Cancelled",
          isCancellable: false
        }));
      } else {
        setCancelError("Failed to cancel the order. Please try again or contact support.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setCancelError(err?.response?.data?.message || "Failed to cancel the order.");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'processing': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'shipped': case 'out for delivery': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPaymentColor = (payment) => {
    switch (payment) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'refunded': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#2C332E]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-6">When you place orders, they will appear here.</p>
          <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-[#2C332E] text-white rounded-full font-medium hover:bg-[#1a1f1c] transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleViewOrder(order.realId)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left: Order Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#2C332E]">{order.id}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{order.date}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">Payment:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPaymentColor(order.payment)}`}>
                        {order.payment}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-xl font-bold text-[#2C332E]">
                    ₹{order.total.toFixed(2)}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#2C332E] transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-700">Order Details</h2>
                {selectedOrder && <p className="text-xs text-slate-400 mt-0.5">#{selectedOrder.id}</p>}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 pt-0 overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  
                  {/* Status Banner */}
                  <div className="bg-white rounded-xl py-3 px-4 border border-slate-200 flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-100">
                      <span className="text-xs font-medium text-slate-500 mb-1.5">Status</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        selectedOrder.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        selectedOrder.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {selectedOrder.status === 'Delivered' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : selectedOrder.status === 'Cancelled' ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>{selectedOrder.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-100">
                      <span className="text-xs font-medium text-slate-500 mb-1.5">Date</span>
                      <span className="text-sm text-slate-700 font-medium">
                        {selectedOrder.date}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-slate-500 mb-1.5">Payment</span>
                      <span className="text-sm text-slate-700 font-medium capitalize">
                        {selectedOrder.payment === 'paid' ? 'Paid via Card' : selectedOrder.payment}
                      </span>
                    </div>
                  </div>

                  {/* Items Ordered */}
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-semibold text-slate-700">Items Ordered</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedOrder.products.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-3 rounded-xl border border-slate-200 bg-white">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-700">{item.name.split(' - ')[0]}</h4>
                              {item.name.includes(' - ') && (
                                <p className="text-xs text-slate-500 mt-1">Shade: <span className="capitalize">{item.name.split(' - ')[1]}</span></p>
                              )}
                              <p className="text-xs text-slate-500 mt-1.5">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium text-slate-700">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-semibold text-slate-700">Order Summary</h3>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="text-slate-700 font-medium">₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Shipping</span>
                        <span className={selectedOrder.shippingAmount === 0 ? "text-emerald-600 font-medium" : "text-slate-700 font-medium"}>
                          {selectedOrder.shippingAmount === 0 ? "Free" : `₹${selectedOrder.shippingAmount.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax</span>
                        <span className="text-slate-700 font-medium">₹{selectedOrder.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800">Total</span>
                        <span className="text-sm font-bold text-slate-800">₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-semibold text-slate-700">Shipping Details</h3>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {/* Order Status Timeline */}
                  {selectedOrder.history && selectedOrder.history.length > 0 && (
                    <div className="space-y-3">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-semibold text-slate-700">Order Timeline</h3>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="space-y-3">
                          {selectedOrder.history.map((hist, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span className="font-medium text-slate-700 text-sm capitalize">
                                  {hist.new_status}
                                  {hist.reason && <span className="text-slate-400 font-normal text-xs ml-2 hidden sm:inline-block truncate max-w-[120px]">({hist.reason})</span>}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">
                                {new Date(hist.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            {selectedOrder && selectedOrder.isCancellable && (
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end rounded-b-xl">
                {cancelError && <p className="text-xs text-rose-500 font-medium mr-4">{cancelError}</p>}
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-5 py-2 rounded-lg border border-rose-300 text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
