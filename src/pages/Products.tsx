import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { TypeAnimation } from 'react-type-animation';
import heroImage from "@/assets/heroimg.jpg";

const categories = [
  { id: "all", name: "All Products", slug: "all" },
  { id: "pure-juice", name: "Pure Juice", slug: "pure-juice" },
  { id: "cleanse", name: "Cleanse Juices", slug: "cleanse" },
  { id: "smoothies", name: "Smoothies", slug: "smoothies" },
  { id: "cut-fruits", name: "Cut Fruits", slug: "cut-fruits" },
  { id: "gift-packs", name: "Gift Packs", slug: "gift-packs" },
  { id: "events", name: "Events", slug: "events" },
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
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

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

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categorySlug === activeCategory);

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    navigate(categorySlug === "all" ? "/products" : `/products/${categorySlug}`, {
      replace: true,
    });
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

      {/* Hero Section */}
      <section className="relative bg-soft-sand overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left text side */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="font-heading font-bold text-4xl md:text-6xl leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                Order bulk packs, corporate plans, or single delights
              </motion.h1>

              <motion.div
                className="text-lg text-muted-foreground max-w-xl mt-4 min-h-[90px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TypeAnimation
                sequence={[
                    "Premium fresh-pressed juices for businesses, events, and wholesale.",
                    2000,
                    "Save up to 18% on bulk orders.",
                    2000,
                ]}
                speed={50}
                repeat={Infinity}
                cursor={true}
                />

              </motion.div>

              <motion.div
                className="flex flex-wrap gap-4 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.7 }}
              >
                <Button variant="hero" size="lg" onClick={handleShopClick}>
                  Shop
                </Button>
                <Button variant="bulk" size="lg" onClick={() => navigate("/bulk-quote")}>
                  Bulk Purchase
                </Button>
              </motion.div>
            </motion.div>

            {/* Right image side */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 1.1, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-orange-200/40 to-yellow-100/20 rounded-lg blur-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              />
              <img
                src={heroImage}
                alt="Fresh juice collection"
                className="relative rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>

        {/* Floating glow animation */}
        <motion.div
          className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-100/40 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

{/* Products section with tabs */}
  <div ref={tabsRef} className="mb-8 overflow-x-auto no-scrollbar">
    <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
      <TabsList className="inline-flex w-auto">
        {categories.map((cat) => (
          <TabsTrigger key={cat.id} value={cat.slug} className="whitespace-nowrap">
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  </div>
<motion.section
  className="container mx-auto px-4 py-4"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>


  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    {filteredProducts.map((product) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * filteredProducts.indexOf(product), duration: 0.4 }}
      >
        <ProductCard {...product} />
      </motion.div>
    ))}
  </div>

  {filteredProducts.length === 0 && (
    <div className="text-center py-16">
      <p className="text-muted-foreground text-lg">
        No products found in this category.
      </p>
    </div>
  )}
</motion.section>


      <Footer />
    </div>
  );
}
