"use client";

import React, { useState, useEffect } from "react";
import ProductHero from "./components/ProductHero";
import ProductLayout from "./components/ProductLayout";
import SidebarFilter from "./components/SidebarFilter";
import ProductGrid from "./components/ProductGrid";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getProductsApi, getProductsByCategoryApi, getFeaturedProductsApi } from "@/services/productsApi";
import { getCategoriesApi } from "@/services/categoryApi";

import { toast } from "react-hot-toast";
import { CheckCircle2, X } from "lucide-react";

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
          
          if (!selectedCategory) {
            try {
              const featRes = await getFeaturedProductsApi();
              if (featRes.status === 200) {
                const featRaw = featRes.data?.data || featRes.data || [];
                const featFormatted = featRaw.map(p => ({
                  ...p,
                  category: 'featured',
                  image: p.primary_image || p.image
                }));
                setProducts([...featFormatted, ...formattedProducts]);
                return;
              }
            } catch (featErr) {
              console.error("Failed to fetch featured products", featErr);
            }
          }
          
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

      {/* Spacer to create a clean white gap before the footer (matches about-us layout) */}
      <div className="w-full h-12 md:h-20 bg-[#f1f0ee]  relative z-10"></div>

      <Footer />
    </div>
  );
}
