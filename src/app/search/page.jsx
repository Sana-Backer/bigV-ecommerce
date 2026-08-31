"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/app/products/components/ProductGrid";
import { searchProductsApi } from "@/services/productsApi";
import { Search } from "lucide-react";

export default function SearchResultsPage() {
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
    // Dispatch custom event to let CartDrawer know if needed, or handle locally
    alert(`Added ${product.name} to bag!`);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#2d3150] selection:text-white bg-[#FCFAF7]">
      <Navbar theme="dark" />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-10 py-12 md:py-24 mt-20">
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
      </main>

      <Footer />
    </div>
  );
}
