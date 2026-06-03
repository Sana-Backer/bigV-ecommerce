"use client";

import React, { useState, useEffect } from "react";
import ProductHero from "./components/ProductHero";
import ProductLayout from "./components/ProductLayout";
import SidebarFilter from "./components/SidebarFilter";
import ProductGrid from "./components/ProductGrid";
import { MOCK_PRODUCTS, CATEGORIES } from "@/lib/mockData";



export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");

  // Cart placeholder handler
  const handleAddToCart = (product) => {
    alert(`Added ${product.name} to bag!`);
  };

  // Filter Logic
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#2d3150] selection:text-white">
      {/* Main Product Hero section */}
      <ProductHero />

      {/* Product list section wrapper */}
      <ProductLayout
        sidebar={
          <SidebarFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        }
      >


        {/* Product Card grid layout */}
        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />
      </ProductLayout>

      {/* Premium Footer */}
      <footer className="py-12 border-t border-[#2d3150]/10 text-center bg-[#f1f0ee] text-[#767676]">
        <p className="text-sm tracking-widest font-light uppercase">© 2026 LUMORA. All rights reserved.</p>
        <p className="text-[10px] tracking-widest opacity-60 mt-1 uppercase">Sleek Design engineered with Next.js and Tailwind CSS.</p>
      </footer>
    </div>
  );
}
