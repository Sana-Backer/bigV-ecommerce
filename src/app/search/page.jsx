"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/app/products/components/ProductGrid";
import { searchProductsApi } from "@/services/productsApi";
import { toast } from "react-hot-toast";
import { Search, CheckCircle2, X } from "lucide-react";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await searchProductsApi(query);
        if (res && res.status === 200) {
          const rawProducts = res.data?.data || res.data || [];
          const formattedProducts = rawProducts.map(p => ({
            ...p,
            category: typeof p.category === 'object' ? p.category?.name?.toLowerCase() : p.category?.toLowerCase() || 'other',
            image: p.primary_image || p.image
          }));
          setProducts(formattedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);

  const handleAddToCart = (product) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-[#2d3150] shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black/10 overflow-hidden`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle2 className="h-10 w-10 text-[#c0a888]" strokeWidth={1.5} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white uppercase tracking-wider">
                Added to Bag
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {product.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-white/10">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ), { duration: 3000 });
  };

  return (
    <>
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-serif text-[#2C332E] mb-4">
          Search Results
        </h1>
        <p className="text-[#5A635B] text-lg font-medium">
          {query.trim() ? (
            <>Showing results for <span className="text-black font-bold">"{query}"</span></>
          ) : (
            "Please enter a search term above."
          )}
        </p>
      </div>

      {query.trim() && !isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="w-16 h-16 text-gray-300 mb-6" />
          <h2 className="text-2xl font-serif text-[#2C332E] mb-2">No products found</h2>
          <p className="text-[#5A635B]">
            We couldn't find anything matching "{query}". Try adjusting your search.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
    </>
  );
}

export default function SearchResultsPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#2d3150] selection:text-white bg-[#FCFAF7]">
      <Navbar theme="dark" />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-10 py-12 md:py-24 mt-20">
        <Suspense fallback={<div className="flex justify-center items-center py-24 text-gray-500">Loading search results...</div>}>
          <SearchResultsContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
