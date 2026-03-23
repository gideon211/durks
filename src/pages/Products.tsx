import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";

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

type ProductsPage = {
  items: Product[];
  hasNextPage: boolean;
  nextPage?: number;
};

const PAGE_SIZE = 12;

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

// fast, robust normalize with memoization
const packsMemo = new Map<string | number | Product, PackEntry[]>();

function normalizePacks(raw: unknown, fallbackPrice = 0, memoKey?: string | number | Product): PackEntry[] {
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
          oldPriceRaw === undefined || oldPriceRaw === null || oldPriceRaw === "" ? null : Number(oldPriceRaw);

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
          oldPriceRaw === undefined || oldPriceRaw === null || oldPriceRaw === "" ? null : Number(oldPriceRaw);

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
      if ((pa[i].oldPrice ?? null) !== (pb[i].oldPrice ?? null)) return false;
    }
    return true;
  }
);

async function fetchProductsPage(category: string, pageParam: number): Promise<ProductsPage> {
  const params: Record<string, string | number> = {
    page: pageParam,
    limit: PAGE_SIZE,
  };

  if (category !== "all") {
    params.category = category;
  }

  const res = await axiosInstance.get("/drinks", { params });
  const data = res.data;

  const items: Product[] = Array.isArray(data?.drinks)
    ? data.drinks
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  const hasNextPage =
    typeof data?.hasMore === "boolean"
      ? data.hasMore
      : typeof data?.nextPage === "number"
      ? true
      : items.length === PAGE_SIZE;

  const nextPage = typeof data?.nextPage === "number" ? data.nextPage : pageParam + 1;

  return { items, hasNextPage, nextPage };
}

export default function Products(): JSX.Element {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  //  URL is the source of truth (no bouncing back to all)
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory ?? "all");

  // tabs wrapper (scroll container)
  const tabsWrapRef = useRef<HTMLDivElement | null>(null);

  // anchor to scroll to (right under sticky tabs)
  const productsTopRef = useRef<HTMLDivElement | null>(null);

  // React Query infinite data
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", activeCategory],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchProductsPage(activeCategory, pageParam as number),
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
    staleTime: 1000 * 60 * 5,
  });

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  // prefetch first page for a category on hover
  const prefetchCategory = useCallback(
    (slug: string) => {
      queryClient.prefetchInfiniteQuery({
        queryKey: ["products", slug],
        initialPageParam: 1,
        queryFn: ({ pageParam }) => fetchProductsPage(slug, pageParam as number),
        getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient]
  );

  // --- helpers ---
  const getHeaderOffset = useCallback(() => {
    const header = document.querySelector("header, #site-header, .site-header, [role='banner']") as HTMLElement | null;
    const headerH = header ? header.getBoundingClientRect().height : 0;

    // your tabs are sticky top-16; account for that too
    const tabsStickyOffset = 64; // tailwind top-16
    return headerH + tabsStickyOffset + 8;
  }, []);

  // FIX: use computed window.scrollTo + retries to beat layout shifts
  const scrollToProductsTop = useCallback(() => {
    const el = productsTopRef.current;
    if (!el) return;

    const doScroll = () => {
      const offset = getHeaderOffset();
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    // run immediately + a couple times after to counter images/layout shifts
    doScroll();
    window.setTimeout(doScroll, 120);
    window.setTimeout(doScroll, 260);
  }, [getHeaderOffset]);

  const centerActiveTab = useCallback((slug: string) => {
    const wrap = tabsWrapRef.current;
    if (!wrap) return;

    const btn = wrap.querySelector<HTMLElement>(`[data-tab-slug="${slug}"]`);
    if (!btn) return;

    btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  // keep activeCategory in sync with URL (single source of truth)
  useEffect(() => {
    setActiveCategory(urlCategory ?? "all");
  }, [urlCategory]);

  // scroll to top and center tab on category change
  useEffect(() => {
    const t = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          centerActiveTab(activeCategory);
          scrollToProductsTop();
        });
      });
    }, 350);

    return () => clearTimeout(t);
  }, [activeCategory, centerActiveTab, scrollToProductsTop]);

  // infinite scroll without manual intersection observer
  useEffect(() => {
    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;

      const threshold = 600;
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;

      if (scrolledToBottom) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      const base = "/products";
      if (categorySlug === "all") navigate(base, { replace: true });
      else navigate(`${base}/${categorySlug}`, { replace: true });
      // do NOT setActiveCategory here; URL effect sets it (prevents bouncing)
    },
    [navigate]
  );

  const handleShopClick = useCallback(() => {
    if (location.pathname.startsWith("/products")) {
      navigate("/products", { replace: true });
      return;
    }
    navigate("/products");
  }, [location.pathname, navigate]);

  const getKeyForProduct = (product: Product) => product._id ?? product.id ?? product.name;

  const loadingProducts = isLoading && products.length === 0;
  const productsError = isError ? (error as Error)?.message ?? "Network error while loading products" : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="mt-20 lg:mt-32">
        <Banner />
      </div>

      {/*  tabs wrapper ref for centering */}
      <div ref={tabsWrapRef} className="mb-8 overflow-x-auto no-scrollbar sticky top-16 z-50 lg:mx-auto">
        <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
          <TabsList className="inline-flex w-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.slug}
                data-tab-slug={cat.slug}
                className="whitespace-nowrap font-semibold"
                onMouseEnter={() => prefetchCategory(cat.slug)}
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/*  anchor right under the sticky tabs */}
      <div ref={productsTopRef} className="h-0" aria-hidden="true" />

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
                  fetchNextPage();
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
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((product) => {
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

            {hasNextPage && (
              <div className="py-6 text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  size="sm"
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
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