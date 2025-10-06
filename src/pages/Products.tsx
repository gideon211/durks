import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import heroImage from '@/assets/heroimg.jpg';

const categories = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'pure-juice', name: 'Pure Juice', slug: 'pure-juice' },
  { id: 'cleanse', name: 'Cleanse Juices', slug: 'cleanse' },
  { id: 'smoothies', name: 'Smoothies', slug: 'smoothies' },
  { id: 'cut-fruits', name: 'Cut Fruits', slug: 'cut-fruits' },
  { id: 'gift-packs', name: 'Gift Packs', slug: 'gift-packs' },
  { id: 'events', name: 'Events', slug: 'events' },
];

export default function Products() {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || 'all');
  const [products, setProducts] = useState<any[]>([]);

  // refs
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // helper: find header element in the DOM (tries a few selectors)
  const findHeaderElement = (): HTMLElement | null => {
    const selectors = ['header', '#site-header', '.site-header', '[role="banner"]'];
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) return el;
    }
    return null;
  };

  // exact scroll that respects header height (works for fixed or sticky headers)
  const scrollTabsIntoViewRespectingHeader = (smooth = true) => {
    if (!tabsRef.current) return;
    const headerEl = findHeaderElement();
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const extraPadding = 8; // px of breathing room between header and tabs
    const tabsRect = tabsRef.current.getBoundingClientRect();
    const target = window.pageYOffset + tabsRect.top - headerHeight - extraPadding;

    window.scrollTo({
      top: target,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // load products
  useEffect(() => {
    fetch('/products.json')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error loading products:', err));
  }, []);

  // keep activeCategory in sync with URL param changes
  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  // On mount: if navigation state requested scroll-to-tabs, scroll and clear that state
  useEffect(() => {
    const shouldScroll = (location.state as any)?.scrollToTabs;
    if (shouldScroll && tabsRef.current) {
      // Wait a tick to ensure layout is settled (images, fonts, etc.)
      requestAnimationFrame(() => {
        // slight delay to account for layout shifts
        setTimeout(() => {
          scrollTabsIntoViewRespectingHeader(true);
          // clear the state so it doesn't re-run on refresh or back/forward
          navigate(location.pathname, { replace: true });
        }, 50);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.categorySlug === activeCategory);

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug);

    // update URL
    if (categorySlug === 'all') {
      navigate('/products', { replace: true });
    } else {
      navigate(`/products/${categorySlug}`, { replace: true });
    }
  };

  // Shop button handler that navigates to /products AND requests tabs to be scrolled into view
  const handleShopClick = () => {
    // If already on /products, just set the category and scroll
    if (location.pathname.startsWith('/products')) {
      setActiveCategory('all');
      // ensure layout settled and then scroll
      setTimeout(() => scrollTabsIntoViewRespectingHeader(true), 60);
      return;
    }

    // If coming from another page, pass navigation state so Products scrolls on mount
    navigate('/products', { state: { scrollToTabs: true } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero section */}
      <section className="relative bg-soft-sand overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="font-heading font-bold text-4xl md:text-6xl leading-tight">
                Order bulk packs, corporate plans, or single delights
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mt-4">
                Premium fresh-pressed juices for businesses, events, and wholesale. Save up to 18% on bulk orders.
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                <Button variant="hero" size="lg" onClick={handleShopClick}>
                  Shop
                </Button>
                <Button variant="bulk" size="lg" onClick={() => navigate('/bulk-quote')}>
                  Bulk Purchase
                </Button>
              </div>
            </div>

            <div className="relative">
              <img src={heroImage} alt="Fresh juice collection" className="rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Products section with tabs */}
      <section className="container mx-auto px-4 py-12">
        {/* tabs wrapper - no scroll-mt class because we compute offset in JS */}
        <div className="mb-8 overflow-x-auto" ref={tabsRef}>
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="inline-flex w-auto no-scrollbar">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.slug} className="whitespace-nowrap">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* products grid */}
        <div className="grid  grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
