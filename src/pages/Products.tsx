import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import heroImage from '@/assets/heroimg.jpg';
import orangeImg from '@/assets/orangefull.jpg';
import cleanseImg from '@/assets/greenfull.jpg';
import smoothiesImg from '@/assets/berryfull.jpg';
import cutFruitsImg from '@/assets/cutsfull.jpg';
import giftPacksImg from '@/assets/trofull.jpg';
import eventsImg from '@/assets/events.jpg';

const categories = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'pure-juice', name: 'Pure Juice', slug: 'pure-juice' },
  { id: 'cleanse', name: 'Cleanse Juices', slug: 'cleanse' },
  { id: 'smoothies', name: 'Smoothies', slug: 'smoothies' },
  { id: 'cut-fruits', name: 'Cut Fruits', slug: 'cut-fruits' },
  { id: 'gift-packs', name: 'Gift Packs', slug: 'gift-packs' },
  { id: 'events', name: 'Events', slug: 'events' },
];

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Orange Sunrise',
    description: 'Fresh-pressed orange juice packed with vitamin C and natural sweetness',
    image: orangeImg,
    price: 8.5,
    category: 'Pure Juice',
    categorySlug: 'pure-juice',
    bulkTiers: [
      { minQty: 1, maxQty: 9, discount: 0 },
      { minQty: 10, maxQty: 49, discount: 8 },
      { minQty: 50, maxQty: 999, discount: 12 },
    ],
  },
  {
    id: '2',
    name: 'Green Detox',
    description: 'Cleansing blend of kale, cucumber, celery, and green apple',
    image: cleanseImg,
    price: 12.0,
    category: 'Cleanse Juices',
    categorySlug: 'cleanse',
    bulkTiers: [
      { minQty: 1, maxQty: 9, discount: 0 },
      { minQty: 10, maxQty: 49, discount: 10 },
      { minQty: 50, maxQty: 999, discount: 15 },
    ],
  },
  {
    id: '3',
    name: 'Berry Blast Smoothie',
    description: 'Creamy blend of strawberries, blueberries, banana, and yogurt',
    image: smoothiesImg,
    price: 10.5,
    category: 'Smoothies',
    categorySlug: 'smoothies',
    bulkTiers: [
      { minQty: 1, maxQty: 9, discount: 0 },
      { minQty: 10, maxQty: 49, discount: 8 },
      { minQty: 50, maxQty: 999, discount: 12 },
    ],
  },
  {
    id: '4',
    name: 'Tropical Mix',
    description: 'Fresh-cut pineapple, mango, papaya, and watermelon',
    image: cutFruitsImg,
    price: 15.0,
    category: 'Cut Fruits',
    categorySlug: 'cut-fruits',
    bulkTiers: [
      { minQty: 1, maxQty: 9, discount: 0 },
      { minQty: 10, maxQty: 49, discount: 10 },
      { minQty: 50, maxQty: 999, discount: 15 },
    ],
  },
  {
    id: '5',
    name: 'Executive Gift Pack',
    description: 'Premium selection of 6 juice varieties in elegant packaging',
    image: giftPacksImg,
    price: 45.0,
    category: 'Gift Packs',
    categorySlug: 'gift-packs',
    bulkTiers: [
      { minQty: 1, maxQty: 9, discount: 0 },
      { minQty: 10, maxQty: 49, discount: 12 },
      { minQty: 50, maxQty: 999, discount: 18 },
    ],
  },
  {
    id: '6',
    name: 'Corporate Event Package',
    description: 'Complete juice station setup for 50-200 guests',
    image: eventsImg,
    price: 250.0,
    category: 'Events',
    categorySlug: 'events',
    bulkTiers: [],
  },
];

/**
 * TypingHero - small in-file component to animate heading + paragraph
 * Props:
 *  - heading: string
 *  - paragraph: string
 *  - typingSpeed: number (ms per char)
 *  - pauseBetween: number (ms between heading finish and paragraph start)
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

  // Heading typing
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

  // Pause then start paragraph
  useEffect(() => {
    if (phase !== 'pause') return;
    const to = setTimeout(() => setPhase('paragraph'), pauseBetween);
    return () => clearTimeout(to);
  }, [phase, pauseBetween]);

  // Paragraph typing
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

  return (
    <section className={`max-w-4xl ${className}`}>
      {/* small cursor style */}
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

      {/* screen-reader friendly live regions */}
      <div aria-live="polite" className="sr-only">
        {typedHeading}
      </div>
      <div aria-live="polite" className="sr-only">
        {typedParagraph}
      </div>
    </section>
  );
}

export default function Products() {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');

  useEffect(() => {
    // sync with URL param if navigation changes outside this component
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  const filteredProducts =
    activeCategory === 'all'
      ? mockProducts
      : mockProducts.filter((p) => p.categorySlug === activeCategory);

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

      {/* Products Section */}
      <section className="container mx-auto px-4 py-12">
        {/* Category Tabs */}
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

        {/* Product Grid */}
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
