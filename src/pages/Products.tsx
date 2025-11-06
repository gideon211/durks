import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import heroImage from "@/assets/heroimg.jpg";

const categories = [
  { id: "all", name: "ALL PRODUCTS", slug: "all" },
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice" },
  { id: "cleanse", name: "CLEANSE JUICES", slug: "cleanse" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies" },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits" },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs" },
  { id: "events", name: "EVENTS", slug: "events" },
  { id: "shots", name: "WELLNESS SHOTS", slug: "shots" },
];

export default function Products() {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "all");
  const [products, setProducts] = useState<any[]>([]);

  const tabsRef = useRef<HTMLDivElement | null>(null);

  const findHeaderElement = (): HTMLElement | null => {
    const selectors = ["header", "#site-header", ".site-header", "[role='banner']"];
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) return el;
    }
    return null;
  };

  const scrollTabsIntoViewRespectingHeader = (smooth = true) => {
    if (!tabsRef.current) return;
    const headerEl = findHeaderElement();
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const tabsRect = tabsRef.current.getBoundingClientRect();
    const target = window.pageYOffset + tabsRect.top - headerHeight - 8;

    window.scrollTo({
      top: target,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  
    useEffect(() => {
    fetch("https://duksshopback-end2-0.onrender.com/api/drinks/")
        .then((res) => res.json())
        .then((data) => {
        const items = Array.isArray(data.drinks) ? data.drinks : [];
        setProducts(items);
        })
        .catch((err) => console.error("Error loading products:", err));
    }, []);


  // ✅ Sync category from URL
  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  // ✅ Scroll into view if navigated with scroll state
  useEffect(() => {
    const shouldScroll = (location.state as any)?.scrollToTabs;
    if (shouldScroll && tabsRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollTabsIntoViewRespectingHeader(true);
          navigate(location.pathname, { replace: true });
        }, 50);
      });
    }
  }, []);

  // ✅ Filter by category
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug);
  };

  const handleShopClick = () => {
    if (location.pathname.startsWith("/products")) {
      setActiveCategory("all");
      setTimeout(() => scrollTabsIntoViewRespectingHeader(true), 60);
      return;
    }
    navigate("/products", { state: { scrollToTabs: true } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Tabs Section */}
      <div
        ref={tabsRef}
        className="mb-8 overflow-x-auto no-scrollbar mt-24 sticky top-16 z-50 lg:mx-auto"
      >
        <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
          <TabsList className="inline-flex w-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.slug}
                className="whitespace-nowrap font-semibold"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-2">
        {filteredProducts.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 * filteredProducts.indexOf(product),
              duration: 0.4,
            }}
          >
            <ProductCard
            id={product._id || product.id}
            name={product.name}
            description={product.description}
            image={product.imageUrl} // use as-is
            price={product.price}
            category={product.category}
            size={product.size}
            packs={product.packs}
            />


          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No products found in this category.
          </p>
        </div>
      )}


      <div>
        <Footer />
      </div>
     
    </div>
  );
}
