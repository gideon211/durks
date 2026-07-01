"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Share2,
  Leaf,
  Heart,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnimatedSwapText from "@/components/AnimatedSwapText";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

const smoothie1 = "/images/smoothie1.jpeg";
const smoothie2 = "/images/smoothie2.jpeg";
const smoothie3 = "/images/smoothie3.jpeg";
const smoothie4 = "/images/smoothie4.jpeg";
const cutFruit1 = "/images/cutFruit1.jpeg";
const cutFruit2 = "/images/cutFruit2.jpeg";
const cutFruit3 = "/images/cutFruit3.jpeg";
const cutFruit4 = "/images/cutFruit4.jpeg";
const gift1 = "/images/gift1.jpeg";
const gift2 = "/images/gift2.jpeg";
const gift3 = "/images/gift3.jpeg";
const gift4 = "/images/gift4.jpeg";
const bundle3 = "/images/bundle3.jpeg";
const flavor1 = "/images/flavor1.jpg";
const flavor2 = "/images/flavor2.jpg";
const flavor3 = "/images/flavor3.jpg";
const flavor4 = "/images/flavor4.jpg";

const productCategories = [
  { id: "bundles", name: "BUNDLES", slug: "bundle", images: [bundle3], description: "Perfectly curated juice packs to serve your unique quantity and dietary needs." },
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice", image: "/images/pure-juice.webp", description: "Single strength juices and delicious juice blend combinations." },
  { id: "cleanse", name: "CLEANSE JUICES", slug: "cleanse", image: "/images/cleanse-juice.webp", description: "Cleanse your system regularly with powerful, carefully selected ingredients." },
  { id: "shots", name: "WELLNESS SHOTS", slug: "shots", image: "/images/wellness-shot.webp", description: "Small but mighty potions of health. Let your shots do the waking up!" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies", images: [smoothie1, smoothie2, smoothie3, smoothie4], description: "Rich blends of powerful detoxing ingredients." },
  { id: "flavors", name: "FLAVORS", slug: "flavors", images: [flavor1, flavor2, flavor3, flavor4], description: "Delicious juice blends for your specific health needs." },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits", images: [cutFruit1, cutFruit2, cutFruit3, cutFruit4], description: "Fresh fruit packs for snacks and desserts." },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs", images: [gift1, gift2, gift3, gift4], description: "Share the gift of health with beautifully curated packs." },
  { id: "events", name: "EVENTS", slug: "events", image: "/images/events.webp", description: "Bulk juice catering for weddings, festivals, and corporate events." },
];

const marqueeMessages = [
  "Packed with vitamins and natural energy",
  "Boost your immunity with every sip",
  "No added sugar, only pure fruit goodness",
  "Stay hydrated and refreshed the healthy way",
];

const faqs = [
  { question: "Can I get juices now, or do I always have to preorder?", answer: "We make fresh juice every day and always have juice in stock. Preordering helps ensure you get your most preferred flavors, quantities, and at your preferred time." },
  { question: "How long do juices stay fresh?", answer: "Fresh natural juices last 3 days in the refrigerator. Without preservatives, they are best kept frozen and can last up to 3 months." },
  { question: "How many flavors do you have?", answer: "We have pure juices, cleanse juices, nutty juices, smoothies, and more. Don't see your flavor online? Reach out to create a custom flavor." },
  { question: "Do you offer bulk juice?", answer: "Yes, we offer bulk and white-label services starting from 300 bottles. Contact us for more details." },
];

const tiktokLinks = [
  { image: "/images/tiktok-1.webp", url: "https://www.tiktok.com/@duksjuice" },
  { image: "/images/tiktok-2.webp", url: "https://www.tiktok.com/@duksjuice" },
  { image: "/images/tiktok-3.webp", url: "https://www.tiktok.com/@duksjuice" },
  { image: "/images/tiktok-4.webp", url: "https://www.tiktok.com/@duksjuice" },
];

const fadeUp = (y = 30) => ({
  hidden: { opacity: 0, y },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
});

export default function Home() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollCarousel = (dir: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleShare = async (name: string, slug: string) => {
    const url = `${window.location.origin}/products/${slug}`;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied!", { icon: "\uD83D\uDD17", duration: 2000 });
    }
  };

  const sectionViewport = { once: true, amount: 0.15 as const };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-white">
        <HeroSection />

        {/* ─── Products Carousel ─── */}
        <section className="py-20 md:py-28 bg-[#f8fafc]">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp()}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3">
                Explore Our Products
              </h2>
              <p className="text-base md:text-lg text-gray-500 max-w-md mx-auto">
                Discover the perfect juice for your lifestyle
              </p>
            </motion.div>
          </div>

          <div className="relative w-full px-4 sm:px-6 lg:px-8">
            <button
              aria-label="Scroll left"
              onClick={() => scrollCarousel("left")}
              className={`hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg shadow-black/8 border border-black/5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              aria-label="Scroll right"
              onClick={() => scrollCarousel("right")}
              className={`hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg shadow-black/8 border border-black/5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div
              ref={carouselRef}
              className="w-full flex gap-5 overflow-x-auto pb-6 no-scrollbar scroll-pl-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {productCategories.map((category) => (
                <div key={category.id} className="w-[280px] sm:w-[300px] flex-shrink-0">
                  <Link
                    href={`/products/${category.slug}`}
                    className="group block relative rounded-[1.5rem] overflow-hidden aspect-[3/4] cursor-pointer"
                  >
                    {/* Full-bleed image — the hero */}
                    <img
                      src={category.images ? category.images[0] : category.image}
                      loading="lazy"
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    />

                    {/* Gradient — bottom 60% fade for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                    {/* Top-right share */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(category.name, category.slug); }}
                      className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      aria-label={`Share ${category.name}`}
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>

                    {/* Bottom content — stacked text on dark scrim */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10">
                      {/* Category tag */}
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[9px] font-bold tracking-[0.12em] uppercase text-white/90 mb-3">
                        {category.name}
                      </span>

                      {/* Description */}
                      <p className="text-[13px] text-white/70 leading-relaxed line-clamp-2 mb-4">
                        {category.description}
                      </p>

                      {/* CTA */}
                      <div className="inline-flex items-center gap-2 bg-white rounded-full py-2.5 px-5 text-[12px] font-bold text-gray-900 tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-green-50 group-hover:text-green-700 group-hover:shadow-lg group-hover:shadow-green-500/20">
                        Shop Now
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Marquee ─── */}
        <div className="bg-green-600 text-white py-2.5 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-green-600 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-green-600 to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex gap-12 whitespace-nowrap will-change-transform"
            animate={{ x: [0, "-50%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          >
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex gap-12 px-6">
                {marqueeMessages.map((msg, index) => (
                  <span key={index} className="text-sm font-medium tracking-wide">{msg}</span>
                ))}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ─── Why Choose Duks ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp()}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600 mb-3">Why Duks</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-4">
                Why Choose Duks
              </h2>
              <img
                src="/images/whychooseus.jpeg"
                loading="lazy"
                alt="Why choose Duks Juice"
                className="w-full max-w-[240px] sm:max-w-xs md:max-w-sm mx-auto h-auto object-contain rounded-xl py-3 sm:py-4"
              />
              <p className="text-base md:text-lg text-gray-500 max-w-lg mx-auto mt-2">
                Every bottle is a commitment to your health and our planet
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  icon: Leaf,
                  title: "Pure & Clean",
                  text: "No added sugar, preservatives, or artificial colors. Juices are bottled as juiced — nothing hidden.",
                  accent: "from-green-500 to-emerald-500",
                  bg: "bg-green-50",
                  border: "border-green-200/70",
                  iconColor: "text-green-600",
                },
                {
                  icon: Sparkles,
                  title: "Maximum Nutrition",
                  text: "Cold-press technology preserves maximum vitamins, minerals, and enzymes in every bottle.",
                  accent: "from-amber-400 to-orange-500",
                  bg: "bg-amber-50",
                  border: "border-amber-200/70",
                  iconColor: "text-amber-600",
                },
                {
                  icon: Heart,
                  title: "Expertly Blended",
                  text: "Our master blenders create flavor combinations that excite your taste buds while nourishing your body.",
                  accent: "from-rose-400 to-pink-500",
                  bg: "bg-rose-50",
                  border: "border-rose-200/70",
                  iconColor: "text-rose-600",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={sectionViewport}
                  variants={fadeUp(15 + index * 80)}
                  className="group relative"
                >
                  {/* Double-bezel: outer shell with colored border */}
                  <div className={`rounded-[1.5rem] bg-gray-50/80 border ${item.border} p-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-lg`}>
                    {/* Inner core */}
                    <div className="rounded-[1.125rem] bg-white p-6 sm:p-7 h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-3`}>
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight mb-2.5 text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                      {/* Accent line */}
                      <div className={`mt-5 h-0.5 w-8 rounded-full bg-gradient-to-r ${item.accent} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TikTok / Social Section ─── */}
        <section className="py-12 md:py-20 bg-neutral-charcoal text-white mt-24 rounded-b-lg">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp()}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-green-300 via-yellow-300 to-green-300 bg-clip-text text-transparent bg-[length:200%_auto]"
                style={{
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              >
                Join us on our socials
              </h2>
              <p className="text-md md:text-xl font-body text-white/80">
                Follow @duks_juice for daily juice inspo, recipes, and wellness tips
              </p>
              <div className="flex gap-6 mx-auto justify-center mt-4">
                <motion.a
                  href="https://www.tiktok.com/@duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <img src="/images/tiktok.svg" loading="lazy" alt="tiktok" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer" />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer" />
                </motion.a>
                <motion.a
                  href="https://facebook.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <img src="/images/facebook.svg" loading="lazy" alt="facebook" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 cursor-pointer object-cover" />
                </motion.a>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {tiktokLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-sm"
                >
                  <img
                    src={item.image}
                    loading="lazy"
                    alt={`TikTok post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/80 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 font-heading">
                      View on TikTok
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp()}
            >
              <Button
                asChild
                size="md"
                className="bg-primary hover:bg-primary/90 text-foreground font-bold"
              >
                <a
                  href="https://www.tiktok.com/@duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow Duks
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp()}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600 mb-3">Questions</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-4">
                Frequently Asked
              </h2>
              <p className="text-base text-gray-500 max-w-md mx-auto">
                Everything you need to know about Duks juices
              </p>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={sectionViewport}
                  variants={fadeUp(10)}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="rounded-2xl border border-gray-100 px-5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden"
                  >
                    <AccordionTrigger className="text-sm sm:text-base font-semibold tracking-tight hover:text-green-600 hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
