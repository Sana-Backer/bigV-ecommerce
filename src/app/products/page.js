"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductHero from "./components/ProductHero";
import ProductLayout from "./components/ProductLayout";
import SidebarFilter from "./components/SidebarFilter";
import ProductGrid from "./components/ProductGrid";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getProductsApi, getFeaturedProductsApi, getProductFilterOptionsApi } from "@/services/productsApi";
import { getCategoriesApi } from "@/services/categoryApi";

import { toast } from "react-hot-toast";
import { CheckCircle2, X } from "lucide-react";

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || "";
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState(""); // default sort from backend if empty

  const [brands, setBrands] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);

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

  // Fetch products and filters
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.append('category', selectedCategory.replace(/ /g, '-'));
        if (selectedBrand) queryParams.append('brand', selectedBrand);
        if (sortBy) queryParams.append('ordering', sortBy);

        const queryStr = queryParams.toString();

        // 1. Fetch filter options
        try {
          const filterRes = await getProductFilterOptionsApi(queryStr);
          if (filterRes.status === 200) {
            const data = filterRes.data?.data || filterRes.data;
            if (data.brands) setBrands(data.brands);
            if (data.sort_options) setSortOptions(data.sort_options);
            // Optionally update categoriesList if needed from filters, but keeping initial fetch is fine too.
          }
        } catch (err) {
          console.error("Failed to fetch filters", err);
        }

        // 2. Fetch products
        let res = await getProductsApi(queryStr);
        if (res.status === 200) {
          const rawProducts = res.data?.data?.results || res.data?.data || [];
          
          const formattedProducts = rawProducts.map(p => ({
            ...p,
            category: typeof p.category === 'object' ? p.category?.name?.toLowerCase() : p.category?.toLowerCase() || 'other',
            image: p.primary_image || p.image
          }));

          // If sort by featured is selected, show only featured products
          if (sortBy === 'featured') {
            try {
              const featRes = await getFeaturedProductsApi();
              if (featRes.status === 200) {
                const featRaw = featRes.data?.data?.results || featRes.data?.data || [];
                let featFormatted = featRaw.map(p => ({
                  ...p,
                  category: 'featured',
                  image: p.primary_image || p.image
                }));
                
                if (selectedCategory) {
                  featFormatted = featFormatted.filter(p => p.category_name?.toLowerCase() === selectedCategory.toLowerCase() || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()));
                }
                if (selectedBrand) {
                  featFormatted = featFormatted.filter(p => p.brand?.name === selectedBrand || p.brand === selectedBrand);
                }
                
                setProducts(featFormatted);
                return;
              }
            } catch (featErr) {
               console.error("Failed to fetch featured products", featErr);
            }
            setProducts([]);
            return;
          }

          // If no filters are applied, optionally fetch and prepend featured products
          if (!selectedCategory && !selectedBrand && !sortBy) {
            try {
              const featRes = await getFeaturedProductsApi();
              if (featRes.status === 200) {
                const featRaw = featRes.data?.data?.results || featRes.data?.data || [];
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
    fetchData();
  }, [selectedCategory, selectedBrand, sortBy]);

  // Cart placeholder handler
  const handleAddToCart = (product) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'
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
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            sortOptions={sortOptions}
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
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
