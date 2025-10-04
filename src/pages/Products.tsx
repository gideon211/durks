import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import heroImage from '@/assets/heroimg.jpg';
import { motion, easeIn, easeInOut } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'pure-juice', name: 'Pure Juice', slug: 'pure-juice' },
  { id: 'cleanse', name: 'Cleanse Juices', slug: 'cleanse' },
  { id: 'smoothies', name: 'Smoothies', slug: 'smoothies' },
  { id: 'cut-fruits', name: 'Cut Fruits', slug: 'cut-fruits' },
  { id: 'gift-packs', name: 'Gift Packs', slug: 'gift-packs' },
  { id: 'events', name: 'Events', slug: 'events' },
];

/**
 * TypingHero - animates heading and paragraph
 */
function TypingHero({
  heading,
  paragraph,
  typingSpeed = 30,
  pauseBetween = 600,
  className = '',
}: {
  heading: string;
  paragraph: string;
  typingSpeed?: number;
  pauseBetween?: number;
  className?: string;
}) {
  const [typedHeading, setTypedHeading] = useState('');
  const [typedParagraph, setTypedParagraph] = useState('');
  const [phase, setPhase] = useState<'heading' | 'pause' | 'paragraph' | 'done'>('heading');

  useEffect(() => {
    if (phase !== 'heading') return;
    let i = 0;
    if (!heading) {
      setPhase('pause');
      return;
    }
    const t = setInterval(() => {
      i += 1;
      setTypedHeading(heading.slice(0, i));
      if (i >= heading.length) {
        clearInterval(t);
        setPhase('pause');
      }
    }, typingSpeed);
    return () => clearInterval(t);
  }, [phase, heading, typingSpeed]);

  useEffect(() => {
    if (phase !== 'pause') return;
    const to = setTimeout(() => setPhase('paragraph'), pauseBetween);
    return () => clearTimeout(to);
  }, [phase, pauseBetween]);

  useEffect(() => {
    if (phase !== 'paragraph') return;
    let i = 0;
    if (!paragraph) {
      setPhase('done');
      return;
    }
    const t = setInterval(() => {
      i += 1;
      setTypedParagraph(paragraph.slice(0, i));
      if (i >= paragraph.length) {
        clearInterval(t);
        setPhase('done');
      }
    }, typingSpeed);
    return () => clearInterval(t);
  }, [phase, paragraph, typingSpeed]);

  const handWaveAnimation = {
    rotate: [0, 15, -10, 15, -10, 15, -10, 15, -10, 15, 0],
    transition: { duration: 1.5, ease: easeInOut },
  };

  return (
    <section className={`max-w-4xl ${className}`}>
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        .typing-cursor {
          display: inline-block;
          width: 0.06em;
          margin-left: 0.18rem;
          background-color: currentColor;
          animation: blink 1s steps(1) infinite;
          vertical-align: text-bottom;
        }
      `}</style>

      <h1 className="font-heading font-bold text-4xl md:text-6xl leading-tight">
        <span>{typedHeading}</span>
        {(phase === 'heading' || (phase === 'pause' && typedHeading.length < heading.length)) && (
          <span className="typing-cursor" aria-hidden="true" />
        )}
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl mt-4">
        <span>{typedParagraph}</span>
        {phase === 'paragraph' && <span className="typing-cursor" aria-hidden="true" />}
      </p>

      <div aria-live="polite" className="sr-only">{typedHeading}</div>
      <div aria-live="polite" className="sr-only">{typedParagraph}</div>
    </section>
  );
}

export default function Products() {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));
  }, []);

  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.categorySlug === activeCategory);

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    navigate(categorySlug === 'all' ? '/products' : `/products/${categorySlug}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {activeCategory === 'all' && (
        <section className="relative bg-soft-sand overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <TypingHero
                  heading="Order bulk packs, corporate plans, or single delights"
                  paragraph="Premium fresh-pressed juices for businesses, events, and wholesale. Save up to 18% on bulk orders."
                  typingSpeed={28}
                  pauseBetween={700}
                />

                <div className="flex flex-wrap gap-4 mt-2">
                  <Button variant="hero" size="lg" onClick={() => handleCategoryChange('all')}>
                    Shop
                  </Button>
                  <Button variant="bulk" size="lg" onClick={() => navigate('/bulk-quote')}>
                    Request Bulk Purchase
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="animate-float">
                  <img src={heroImage} alt="Fresh juice collection" className="rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 overflow-x-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
