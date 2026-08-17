"use client";

import React, { useState, useEffect } from "react";
import ProductHero from "./components/ProductHero";
import ProductLayout from "./components/ProductLayout";
import SidebarFilter from "./components/SidebarFilter";
import ProductGrid from "./components/ProductGrid";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getProductsApi, getProductsByCategoryApi } from "@/services/productsApi";
import { getCategoriesApi } from "@/services/categoryApi";

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        if (res.status === 200) {
          const apiCats = res.data?.data || res.data || [];
          setCategoriesList(apiCats.map(c => c.name.toLowerCase()));
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let res;
        if (selectedCategory) {
          const slug = selectedCategory.replace(/ /g, '-');
          res = await getProductsByCategoryApi(slug);
        } else {
          res = await getProductsApi();
        }
        
        if (res.status === 200) {
          let rawProducts = [];
          if (selectedCategory) {
            rawProducts = res.data?.data?.products || [];
          } else {
            rawProducts = res.data?.data || [];
          }
          
          // Map product.category to a lowercase string so ProductGrid groups correctly
          const formattedProducts = rawProducts.map(p => ({
            ...p,
            category: typeof p.category === 'object' ? p.category?.name?.toLowerCase() : p.category?.toLowerCase() || 'other',
            image: p.primary_image || p.image // Ensure image prop works if ProductCard expects it
          }));
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Cart placeholder handler
  const handleAddToCart = (product) => {
    alert(`Added ${product.name} to bag!`);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#2d3150] selection:text-white">
      <Navbar />
      {/* Main Product Hero section */}
      <ProductHero />

      {/* Product list section wrapper */}
      <ProductLayout
        sidebar={
          <SidebarFilter
            categories={categoriesList.length > 0 ? categoriesList : ["beauty care", "kitchen essential", "powders"]}
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
          products={products}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />
      </ProductLayout>

      {/* Premium Footer */}
      <Footer />
    </div>
  );
}
