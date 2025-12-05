import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Banner from "../components/CallToOrderBanner";
import ProductCardSkeleton from "@/components/ProductCardSkeleton"
type PackEntry = { pack: number; price: number };

type Product = {
  _id?: string;
  id?: string | number;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number | null;
  category?: string;
  size?: string;
  /**
   * packs can be many shapes from the API: string, number, object, array...
   * we treat it as unknown and normalize below.
   */
  packs?: unknown;
};

const categories = [
  { id: "all", name: "ALL PRODUCTS", slug: "all" },
  {id: "bundles", name:"BUNDLES", slug: "bundle"},
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice" },
  { id: "cleanse", name: "CLEANSE JUICES", slug: "cleanse" },
  { id: "shots", name: "WELLNESS SHOTS", slug: "shots" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies" },
  { id: "flavors", name: "FLAVORS", slug: "flavor" },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits" },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs" },
  { id: "events", name: "EVENTS", slug: "events" },
  
];

const PRODUCTS_API = "https://updated-duks-backend-1-0.onrender.com/api/drinks/";

/**
 * Normalize various backend `packs` shapes into PackEntry[]:
 * Supported input shapes:
 * - PackEntry[] (already correct)
 * - number (e.g. 500) -> [{ pack: 500, price: fallbackPrice }]
 * - string JSON (e.g. '[{"pack":500,"price":2500}]') -> parsed and normalized
 * - string CSV like '500:2500,1000:4500' or '500,1000' -> parsed
 * - object map like { "500": 2500, "1000": 4500 }
 * - array of numbers or strings like ['500','1000'] or [500,1000]
 */
function normalizePacks(raw: unknown, fallbackPrice: number = 0): PackEntry[] {
  const out: PackEntry[] = [];

  if (raw == null) return out;

  // If already array
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item == null) continue;
      // item is PackEntry-like
      if (typeof item === "object" && "pack" in (item as any) && "price" in (item as any)) {
        const packNum = Number((item as any).pack);
        const priceNum = Number((item as any).price);
        if (!Number.isNaN(packNum) && !Number.isNaN(priceNum)) out.push({ pack: packNum, price: priceNum });
        continue;
      }
      // item is number
      if (typeof item === "number") {
        out.push({ pack: item, price: fallbackPrice });
        continue;
      }
      // item is string like "500:2500" or "500"
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (!trimmed) continue;
        // try "500:2500" or "500-2500"
        const sep = trimmed.includes(":") ? ":" : trimmed.includes("-") ? "-" : null;
        if (sep) {
          const [p, pr] = trimmed.split(sep).map((s) => s.trim());
          const packNum = Number(p);
          const priceNum = Number(pr ?? fallbackPrice);
          if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: Number.isNaN(priceNum) ? fallbackPrice : priceNum });
        } else {
          const packNum = Number(trimmed);
          if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: fallbackPrice });
        }
        continue;
      }
      // fallback: try to coerce object
      if (typeof item === "object") {
        const packNum = Number((item as any).pack ?? (item as any).size ?? (item as any).qty);
        const priceNum = Number((item as any).price ?? (item as any).amount ?? fallbackPrice);
        if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: Number.isNaN(priceNum) ? fallbackPrice : priceNum });
      }
    }
    return out;
  }

  // If raw is object map like { "500": 2500 }
  if (typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, unknown>);
    for (const [k, v] of entries) {
      const packNum = Number(k);
      const priceNum = Number(v as any);
      if (!Number.isNaN(packNum) && !Number.isNaN(priceNum)) out.push({ pack: packNum, price: priceNum });
    }
    if (out.length) return out;
  }

  // If raw is number
  if (typeof raw === "number") {
    return [{ pack: raw, price: fallbackPrice }];
  }

  // If raw is string: try JSON then CSV-like parsing
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return out;
    // Try JSON
    try {
      const parsed = JSON.parse(s);
      return normalizePacks(parsed, fallbackPrice);
    } catch {
      // not JSON -> parse CSV "500:2500,1000:4500" or "500,1000"
      const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        const sep = part.includes(":") ? ":" : part.includes("-") ? "-" : null;
        if (sep) {
          const [p, pr] = part.split(sep).map((x) => x.trim());
          const packNum = Number(p);
          const priceNum = Number(pr ?? fallbackPrice);
          if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: Number.isNaN(priceNum) ? fallbackPrice : priceNum });
        } else {
          const packNum = Number(part);
          if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: fallbackPrice });
        }
      }
      return out;
    }
  }

  return out;
}

/**
 * Products page with stale-while-revalidate and normalized packs passed to ProductCard.
 */
export default function Products(): JSX.Element {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "all");
  const [products, setProducts] = useState<Product[]>([]);
  const lastSuccessfulRef = useRef<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const tabsRef = useRef<HTMLDivElement | null>(null);

  const findHeaderElement = (): HTMLElement | null => {
    const selectors = ["header", "#site-header", ".site-header", "[role='banner']"];
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) return el;
    }
    return null;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

  // Seed cache from localStorage to avoid blank UI when backend slow
  useEffect(() => {
    try {
      const raw = localStorage.getItem("duks_products_cache");
      if (raw) {
        const parsed = JSON.parse(raw) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          lastSuccessfulRef.current = parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to read products cache:", err);
    }
  }, []);

  const fetchProducts = async (signal?: AbortSignal) => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const res = await fetch(PRODUCTS_API, { signal });
      if (!res.ok) {
        let msg = `Server error: ${res.status}`;
        try {
          const body = await res.json();
          if (body?.message) msg = String(body.message);
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const json = await res.json();
      const items: Product[] = Array.isArray(json.drinks) ? json.drinks : Array.isArray(json) ? json : [];

      if (!Array.isArray(items)) throw new Error("Invalid response format");

      setProducts(items);
      lastSuccessfulRef.current = items;
      try {
        localStorage.setItem("duks_products_cache", JSON.stringify(items));
      } catch {
        // ignore localStorage errors
      }
      setProductsError(null);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setProducts(lastSuccessfulRef.current || []);
      setProductsError(err?.message ?? "Network error while loading products");
      console.error("Products fetch failed:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchProducts(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL category -> state
  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  // Scroll on navigation state
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts =
    activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

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

      <div className="mt-20 lg:mt-32">
        <Banner />
      </div>

      {/* Tabs Section */}
      <div ref={tabsRef} className="mb-8 overflow-x-auto no-scrollbar sticky top-16 z-50 lg:mx-auto">
        <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
          <TabsList className="inline-flex w-auto">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.slug} className="whitespace-nowrap font-semibold">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Non-blocking error banner */}
      {productsError && (
        <div className="container mx-auto px-4 mb-6">
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <div>
              <strong className="font-semibold">Network issue:</strong>{" "}
              <span className="ml-1">{productsError}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const c = new AbortController();
                  fetchProducts(c.signal);
                }}
                className="bg-red-600 text-white"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            // Normalize packs into PackEntry[]
            const packsProp: PackEntry[] = normalizePacks(product.packs, typeof product.price === "number" ? product.price : 0);

            // If no packs but price exists, create a default pack entry
            const finalPacks: PackEntry[] = packsProp.length > 0 ? packsProp : (typeof product.price === "number" ? [{ pack: 1, price: product.price }] : []);

            return (
              <motion.div
                key={product._id ?? product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.03 * Math.max(0, filteredProducts.indexOf(product)),
                  duration: 0.35,
                }}
              >
                <ProductCard
                  id={product._id || product.id}
                  name={product.name}
                  description={product.description}
                  image={product.imageUrl}
                  price={product.price}
                  category={product.category}
                  size={product.size}
                  packs={finalPacks as PackEntry[]}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && !loadingProducts && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}

        {/* Loading indicator */}
        {loadingProducts && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
            ))}
        </div>
        )}


      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
}
