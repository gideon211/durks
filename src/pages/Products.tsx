import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Banner from "../components/CallToOrderBanner";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

type PackEntry = { pack: number; price: number; oldPrice?: number | null };

type Product = {
  _id?: string;
  id?: string | number;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number | null;
  category?: string;
  size?: string;
  packs?: unknown;
};

const categories = [
  { id: "all", name: "ALL PRODUCTS", slug: "all" },
  { id: "bundles", name: "BUNDLES", slug: "bundle" },
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
const CACHE_KEY = "duks_products_cache_v2";
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

// fast, robust normalize with memoization
const packsMemo = new Map<string | number | Product, PackEntry[]>();

function normalizePacks(
  raw: unknown,
  fallbackPrice = 0,
  memoKey?: string | number | Product
): PackEntry[] {
  // memo lookup
  if (memoKey != null) {
    const hit = packsMemo.get(memoKey);
    if (hit) return hit;
  }

  const out: PackEntry[] = [];
  if (raw == null) {
    if (memoKey != null) packsMemo.set(memoKey, out);
    return out;
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item == null) continue;

      if (typeof item === "object" && "pack" in (item as any) && "price" in (item as any)) {
        const packNum = Number((item as any).pack);
        const priceNum = Number((item as any).price);

        const oldPriceRaw = (item as any).oldPrice;
        const oldPriceNum =
          oldPriceRaw === undefined || oldPriceRaw === null || oldPriceRaw === ""
            ? null
            : Number(oldPriceRaw);

        if (!Number.isNaN(packNum) && !Number.isNaN(priceNum)) {
          out.push({
            pack: packNum,
            price: priceNum,
            oldPrice: oldPriceNum === null || Number.isNaN(oldPriceNum) ? null : oldPriceNum,
          });
        }
        continue;
      }

      if (typeof item === "number") {
        out.push({ pack: item, price: fallbackPrice, oldPrice: null });
        continue;
      }

      if (typeof item === "string") {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const sep = trimmed.includes(":") ? ":" : trimmed.includes("-") ? "-" : null;

        if (sep) {
          const [p, pr] = trimmed.split(sep).map((s) => s.trim());
          const packNum = Number(p);
          const priceNum = Number(pr ?? fallbackPrice);
          if (!Number.isNaN(packNum)) {
            out.push({
              pack: packNum,
              price: Number.isNaN(priceNum) ? fallbackPrice : priceNum,
              oldPrice: null,
            });
          }
        } else {
          const packNum = Number(trimmed);
          if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: fallbackPrice, oldPrice: null });
        }
        continue;
      }

      if (typeof item === "object") {
        const packNum = Number((item as any).pack ?? (item as any).size ?? (item as any).qty);
        const priceNum = Number((item as any).price ?? (item as any).amount ?? fallbackPrice);

        const oldPriceRaw = (item as any).oldPrice;
        const oldPriceNum =
          oldPriceRaw === undefined || oldPriceRaw === null || oldPriceRaw === ""
            ? null
            : Number(oldPriceRaw);

        if (!Number.isNaN(packNum)) {
          out.push({
            pack: packNum,
            price: Number.isNaN(priceNum) ? fallbackPrice : priceNum,
            oldPrice: oldPriceNum === null || Number.isNaN(oldPriceNum) ? null : oldPriceNum,
          });
        }
      }
    }

    if (memoKey != null) packsMemo.set(memoKey, out);
    return out;
  }

  if (typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, unknown>);
    for (const [k, v] of entries) {
      const packNum = Number(k);
      const priceNum = Number(v as any);
      if (!Number.isNaN(packNum) && !Number.isNaN(priceNum)) {
        out.push({ pack: packNum, price: priceNum, oldPrice: null });
      }
    }
    if (out.length) {
      if (memoKey != null) packsMemo.set(memoKey, out);
      return out;
    }
  }

  if (typeof raw === "number") {
    const r: PackEntry[] = [{ pack: raw, price: fallbackPrice, oldPrice: null }];
    if (memoKey != null) packsMemo.set(memoKey, r);
    return r;
  }

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) {
      if (memoKey != null) packsMemo.set(memoKey, out);
      return out;
    }
    try {
      const parsed = JSON.parse(s);
      const result = normalizePacks(parsed, fallbackPrice, memoKey);
      if (memoKey != null) packsMemo.set(memoKey, result);
      return result;
    } catch {
      const parts = s
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      for (const part of parts) {
        const sep = part.includes(":") ? ":" : part.includes("-") ? "-" : null;

        if (sep) {
          const [p, pr] = part.split(sep).map((x) => x.trim());
          const packNum = Number(p);
          const priceNum = Number(pr ?? fallbackPrice);
          if (!Number.isNaN(packNum)) {
            out.push({
              pack: packNum,
              price: Number.isNaN(priceNum) ? fallbackPrice : priceNum,
              oldPrice: null,
            });
          }
        } else {
          const packNum = Number(part);
          if (!Number.isNaN(packNum)) out.push({ pack: packNum, price: fallbackPrice, oldPrice: null });
        }
      }

      if (memoKey != null) packsMemo.set(memoKey, out);
      return out;
    }
  }

  if (memoKey != null) packsMemo.set(memoKey, out);
  return out;
}

// lightweight memo wrapper for ProductCard props to avoid rerenders
const MemoProductCard = React.memo(
  function MemoProductCard(props: {
    id?: string | number;
    name: string;
    description?: string;
    image?: string;
    price?: number | null;
    category?: string;
    size?: string;
    packs?: PackEntry[];
  }) {
    return <ProductCard {...(props as any)} />;
  },
  (a, b) => {
    // shallow compare keys likely to change
    if (a.id !== b.id) return false;
    if (a.name !== b.name) return false;
    if (a.image !== b.image) return false;
    if (a.price !== b.price) return false;
    if (a.category !== b.category) return false;
    if (a.size !== b.size) return false;
    const pa = a.packs || [];
    const pb = b.packs || [];
    if (pa.length !== pb.length) return false;
    for (let i = 0; i < pa.length; ++i) {
      if (pa[i].pack !== pb[i].pack || pa[i].price !== pb[i].price) return false;
      // include oldPrice so memo doesn't block UI updates
      if ((pa[i].oldPrice ?? null) !== (pb[i].oldPrice ?? null)) return false;
    }
    return true;
  }
);

export default function Products(): JSX.Element {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "all");
  const [products, setProducts] = useState<Product[]>([]);
  const lastSuccessfulRef = useRef<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const tabsRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // pagination / incremental render
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // read cache synchronously for fastest possible paint
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; items: Product[] };
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          setProducts(parsed.items);
          lastSuccessfulRef.current = parsed.items;
          const age = Date.now() - (parsed.ts || 0);
          // if cache fresh, no immediate network block
          if (age < CACHE_TTL_MS) {
            setLoadingProducts(false);
            setProductsError(null);
            return;
          }
        }
      }
    } catch (err) {
      // ignore cache errors
    }
    // leave loading state true if no cache
  }, []);

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    setProductsError(null);
    try {
      const res = await fetch(PRODUCTS_API, { signal });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      const items: Product[] = Array.isArray(json.drinks) ? json.drinks : Array.isArray(json) ? json : [];
      if (!Array.isArray(items)) throw new Error("Invalid response format");

      setProducts(items);
      lastSuccessfulRef.current = items;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      } catch {}
      setProductsError(null);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      // fallback to last known good cache
      setProducts(lastSuccessfulRef.current || []);
      setProductsError(err?.message ?? "Network error while loading products");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    // if we had cache visible, we treat this as stale-while-revalidate
    fetchProducts(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchProducts]);

  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  // handle scroll to tabs from nav state
  useEffect(() => {
    const shouldScroll = (location.state as any)?.scrollToTabs;
    if (!shouldScroll || !tabsRef.current) return;
    const header = document.querySelector("header, #site-header, .site-header, [role='banner']") as HTMLElement | null;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const rect = tabsRef.current.getBoundingClientRect();
    const target = window.pageYOffset + rect.top - headerHeight - 8;
    window.scrollTo({ top: target, behavior: "smooth" });
    navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  // reset visible count when category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, products.length]);

  // slice visible products
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // intersection observer to load more
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => {
              const next = Math.min(filteredProducts.length, prev + PAGE_SIZE);
              return next;
            });
          }
        }
      },
      { root: null, rootMargin: "400px", threshold: 0.01 }
    );
    const obs = observerRef.current;
    if (sentinelRef.current) obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [filteredProducts.length]);

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      setActiveCategory(categorySlug);
      // update url without reload
      const base = "/products";
      if (categorySlug === "all") navigate(base, { replace: true });
      else navigate(`${base}/${categorySlug}`, { replace: true });
    },
    [navigate]
  );

  const handleShopClick = useCallback(() => {
    if (location.pathname.startsWith("/products")) {
      setActiveCategory("all");
      setTimeout(() => {
        const header = document.querySelector("header, #site-header, .site-header, [role='banner']") as HTMLElement | null;
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        if (tabsRef.current) {
          const rect = tabsRef.current.getBoundingClientRect();
          window.scrollTo({ top: window.pageYOffset + rect.top - headerHeight - 8, behavior: "smooth" });
        }
      }, 60);
      return;
    }
    navigate("/products", { state: { scrollToTabs: true } });
  }, [location.pathname, navigate]);

  // helper to get key
  const getKeyForProduct = (product: Product) => product._id ?? product.id ?? product.name;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="mt-20 lg:mt-32">
        <Banner />
      </div>

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

      {productsError && (
        <div className="container mx-auto px-4 mb-6">
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <div>
              <strong className="font-semibold">Network issue:</strong>
              <span className="ml-1">{productsError}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const c = new AbortController();
                  setLoadingProducts(true);
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

      <div className="container mx-auto px-4">
        {loadingProducts && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleProducts.map((product) => {
                const memoKey = getKeyForProduct(product);

                const packsProp: PackEntry[] = normalizePacks(
                  product.packs,
                  typeof product.price === "number" ? product.price : 0,
                  memoKey
                );

                const finalPacks: PackEntry[] =
                  packsProp.length > 0
                    ? packsProp
                    : typeof product.price === "number"
                    ? [{ pack: 1, price: product.price, oldPrice: null }]
                    : [];

                return (
                  <div key={memoKey} className="transform transition duration-150 hover:-translate-y-0.5">
                    <MemoProductCard
                      id={product._id || product.id}
                      name={product.name}
                      description={product.description}
                      image={product.imageUrl}
                      price={product.price}
                      category={product.category}
                      size={product.size}
                      packs={finalPacks}
                    />
                  </div>
                );
              })}
            </div>

            <div ref={sentinelRef} className="h-6" />

            {visibleProducts.length < filteredProducts.length && (
              <div className="py-6 text-center">
                <Button onClick={() => setVisibleCount((v) => Math.min(filteredProducts.length, v + PAGE_SIZE))} size="sm">
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}