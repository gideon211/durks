import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import HeroSection from "@/layout/HeroSection";
import pureJuiceImage from "@/assets/pure-juice.webp";
import cleanseJuiceImage from "@/assets/cleanse-juice.webp";
import wellnessPacksImage from "@/assets/wellness-shot.webp";
import chooseImage from "@/assets/whychooseus.jpeg";
import eventsImage from "@/assets/events.webp";
import tiktok1 from "@/assets/tiktok-1.webp";
import tiktok2 from "@/assets/tiktok-2.webp";
import tiktok3 from "@/assets/tiktok-3.webp";
import tiktok4 from "@/assets/tiktok-4.webp";

import Instagram from "@/assets/instagram.svg";
import Tiktok from "@/assets/tiktok.svg";
import Facebook from "@/assets/facebook.svg";

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

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

const productCategories = [
  {
    id: "bundles",
    name: "BUNDLES",
    slug: "bundle",
    images: [bundle3],
    fruits: "",
    description:
      "Perfectly curated juice packs to serve your unique quantity and dietary needs.",
  },
  {
    id: "pure-juice",
    name: "PURE JUICES",
    slug: "pure-juice",
    image: pureJuiceImage,
    description:
      "Juices made from single strength juices and delicious juice blend combinations.",
    fruits: "Oranges, Apples, Watermelon, Pineapple, Grapes",
    benefit: "High in Vitamin C & Natural Energy",
    bgColor: "bg-[#007a56]",
  },
  {
    id: "cleanse",
    name: "CLEANSE JUICES",
    slug: "cleanse",
    image: cleanseJuiceImage,
    description:
      "The body heals itself, but sometimes it needs support. Cleanse your system regularly with these powerful, carefully selected ingredients.",
    fruits: "Kale, Spinach, Cucumber, Celery, Lemon, Ginger, Green Apple",
    benefit: "Natural Detox & Metabolism Boost",
    bgColor: "bg-[#eb2e4f]",
  },
  {
    id: "shots",
    name: "WELLNESS SHOTS",
    description:
      "Small but mighty little potions of health. Let your shots do the waking up!",
    slug: "shots",
    image: wellnessPacksImage,
    fruits: "Ginger, Turmeric, Beetroot, Wheatgrass, Cayenne, Lemon",
  },
  {
    id: "smoothies",
    name: "SMOOTHIES",
    slug: "smoothies",
    description: "Team thick, Rich blends of powerful detoxing ingredients. ",
    fruits:
      "Bananas, Strawberries, Blueberries, Mangos, Avocado, Dates, Coconut",
    benefit: "Protein-Rich & Sustained Energy",
    bgColor: "bg-[#ff7017]",
    images: [smoothie1, smoothie2, smoothie3, smoothie4],
  },
  {
    id: "flavors",
    name: "FLAVORS",
    slug: "flavors",
    description:
      "A wide range of delicious juice blends to meet your specific health needs and event goals.",
    images: [flavor1, flavor2, flavor3, flavor4],
    fruits:
      "Strawberry, Mango, Coconut, Berry Fusion (Flavor-Based Assortment)",
  },
  {
    id: "cut-fruits",
    name: "CUT FRUITS",
    slug: "cut-fruits",
    description:
      "Sometimes you want the fruits serve in snacks and desserts. Grab your fruit packs",
    fruits: "Pineapple, Watermelon, Cantaloupe, Berries, Grapes, Kiwi",
    benefit: "Convenient & Vitamin-Packed Snacking",
    bgColor: "bg-[#054525]",
    images: [cutFruit1, cutFruit2, cutFruit3, cutFruit4],
  },
  {
    id: "gift-packs",
    name: "GIFT PACKS",
    slug: "gift-packs",
    description:
      "Share the gift of health with our beautifully curated gift packs. Each collection features an assortment of our bestselling juices, smoothies, and wellness shots, elegantly packaged.",
    fruits:
      "Premium Assorted Selection: Berries, Pineapple, Grapes, Citrus Mix, Exotic Fruits",
    benefit: "Thoughtful Wellness Gifting",
    bgColor: "bg-[#007a56]",
    images: [gift1, gift2, gift3, gift4],
  },
  {
    id: "events",
    name: "EVENTS",
    slug: "events",
    image: eventsImage,
    description:
      "Elevate your events with our bulk juice catering service. From corporate wellness programs to weddings and festivals, we provide fresh, custom juice bars with professional service.",
    fruits: "Custom Event-Based Selection",
    benefit: "Professional Catering & Bulk Orders",
    bgColor: "bg-[#eb2e4f]",
  },
];

const messages = [
  "Packed with vitamins and natural energy",
  "Boost your immunity with every sip",
  "No added sugar, only pure fruit goodness",
  "Stay hydrated and refreshed the healthy way",
];

const faqs = [
  {
    question: "Can I get juices now, or do I always have to preorder?",
    answer:
      "We make fresh juice every day and always have juice in stock. We understand people have peculiar needs when it comes to juices. To better serve you, preordering helps ensure you get your most preferred juice flavors, quantities, and at your preferred time.",
  },
  {
    question: "How long do juices stay fresh?",
    answer:
      "Fresh natural juices last only 3 days in the refrigerator. Fresh natural juices without preservatives are best kept frozen and can last up to 3 months frozen.",
  },
  {
    question: "How many flavors do you have?",
    answer:
      "We have a wide range of flavors including pure juices, cleanse juices, nutty juices, and smoothies to handle different dietary and health needs. Don't see your flavor online? Simply reach out to create your custom flavor.",
  },
  {
    question: "Do you offer bulk juice?",
    answer:
      "Yes, we offer bulk and white-label services starting from 300 bottles. Contact us for more details.",
  },
];

const tiktokLinks = [
  { image: tiktok1, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok2, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok3, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok4, url: "https://www.tiktok.com/@duksjuice" },
];

const easeOutExpo = [0.19, 1, 0.22, 1];
const easeOutCirc = [0.075, 0.82, 0.165, 1];

const fadeSlideUp = (y = 50, duration = 0.8) => ({
  hidden: { opacity: 0, y },
  visible: { opacity: 1, y: 0, transition: { duration, ease: easeOutExpo } },
});

const staggerContainer = (delay = 0.15) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
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
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleShare = async (name: string, slug: string) => {
    const url = `${window.location.origin}/products/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied!", {
        icon: "🔗",
        duration: 2000,
      });
    }
  };

  const sectionViewport = { once: true, amount: 0.2 as const };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-white">
        <HeroSection />

        {/* ─── Products Carousel ─── */}
        <motion.section
          className="py-[5rem] md:py-20 bg-muted/30 relative"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={staggerContainer(0.12)}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              variants={fadeSlideUp(50, 0.8)}
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">
                Explore Our Products
              </h2>
              <p className="text-md md:text-xl font-body text-muted-foreground">
                Discover the perfect juice for your lifestyle
              </p>
            </motion.div>
          </div>

            <div className="relative w-full px-4 md:px-8">
              <motion.button
                aria-label="Scroll left"
                onClick={() => scrollCarousel("left")}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={sectionViewport}
                transition={{ duration: 0.6, ease: easeOutExpo }}
                className={`hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-md bg-white/90 hover:bg-white transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-40 pointer-events-auto"}`}
                style={{ transform: "translateY(-50%)" }}
              >
                <ChevronLeft className="w-6 h-6 text-neutral-900" />
              </motion.button>

              <motion.button
                aria-label="Scroll right"
                onClick={() => scrollCarousel("right")}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={sectionViewport}
                transition={{ duration: 0.6, ease: easeOutExpo }}
                className={`hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-md bg-white/90 hover:bg-white transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-40 pointer-events-none"}`}
                style={{ transform: "translateY(-50%)" }}
              >
                <ChevronRight className="w-6 h-6 text-neutral-900" />
              </motion.button>

              <motion.div
                ref={carouselRef}
                className="w-full flex gap-4 overflow-x-auto pb-6 no-scrollbar smooth-scroll scroll-pl-4"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={staggerContainer(0.1)}
                style={{ scrollBehavior: "smooth" }}
              >
                {productCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="w-[300px] flex-shrink-0"
                    variants={{
                      hidden: { opacity: 0, y: 60, rotateX: 12, perspective: 1000 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        transition: { duration: 0.9, ease: easeOutCirc },
                      },
                    }}
                  >
                    <div className="relative rounded-sm overflow-hidden group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
                      <div className="relative h-[36rem] overflow-hidden">
                        {category.images ? (
                          <div className="w-full h-full">
                            {category.images.slice(0, 4).map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                loading="lazy"
                                alt={`${category.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={category.image}
                            loading="lazy"
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />
                        <button
                          onClick={() => handleShare(category.name, category.slug)}
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          aria-label={`Share ${category.name}`}
                        >
                          <Share2 className="h-4 w-4 text-white" />
                        </button>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-4 backdrop-blur-md bg-black/40 rounded-t-2xl transition-all duration-700 md:group-hover:bg-black/60">
                        <div className="flex items-center justify-between">
                          <h2 className="text-white text-lg md:text-xl font-bold">
                            {category.name}
                          </h2>
                          <motion.button
                            className="w-8 h-8 bg-white text-green-700 rounded-full flex items-center justify-center text-2xl font-bold"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={sectionViewport}
                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }}
                          >
                            +
                          </motion.button>
                        </div>

                        <div className="mt-2 text-white text-sm leading-relaxed opacity-100 md:opacity-90 md:group-hover:opacity-100 h-[78px] overflow-hidden">
                          <p className="text-xs opacity-95">
                            {category.description}
                          </p>
                        </div>

                        <Link
                          to={`/products/${category.slug}`}
                          className="inline-flex items-center mt-2 bg-white text-green-700 font-semibold py-2 px-4 rounded-full text-sm"
                        >
                          Shop Now
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
        </motion.section>

        {/* ─── Marquee Ticker ─── */}
        <div className="bg-green-600 text-white py-2 overflow-hidden font-lexend border-2 border-t-red-400 relative">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-green-600 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-green-600 to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex gap-12 whitespace-nowrap will-change-transform"
            animate={{ x: [0, "-50%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          >
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex gap-12 px-8">
                {messages.map((msg, index) => (
                  <span key={index}>{msg}</span>
                ))}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ─── Why Choose Duks ─── */}
        <motion.section
          className="md:py-20 mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={staggerContainer(0.12)}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              variants={fadeSlideUp(50, 0.8)}
            >
              <h2 className="text-xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Why Choose Duks
              </h2>
              <div>
                <motion.img
                  src={chooseImage}
                  loading="lazy"
                  alt="why choose us Image"
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto h-auto object-contain rounded-md py-4"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={sectionViewport}
                  transition={{ duration: 1.2, ease: easeOutExpo }}
                />
              </div>
              <p className="text-md md:text-xl font-semibold text-muted-foreground max-w-2xl mx-auto">
                Every bottle is a commitment to your health and our planet
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-8"
              variants={staggerContainer(0.15)}
            >
              {[
                { icon: Leaf, title: "Credibility", text: "Juices are all pure with no added sugar, preservatives and artificial colors. Juices are bottled as juiced." },
                { icon: Sparkles, title: "Bursting with Benefits", text: "Cold-press technology preserves maximum vitamins, minerals, and enzymes." },
                { icon: Heart, title: "Deliciously Elevated", text: "Our master blenders create flavor combinations that excite your taste buds while nourishing your body." },
              ].map((item, index) => {
                const xOffset = index === 0 ? -60 : index === 2 ? 60 : 0;
                const yOffset = index === 1 ? 60 : 0;
                return (
                  <motion.div
                    key={index}
                    className="border border-green-400 rounded-md p-3 sm:p-4 md:p-5 transition-all duration-300"
                    variants={{
                      hidden: { opacity: 0, x: xOffset, y: yOffset },
                      visible: {
                        opacity: 1, x: 0, y: 0,
                        transition: { duration: 0.9, ease: easeOutCirc },
                      },
                    }}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
                      borderColor: "rgb(34, 197, 94)",
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4 py-2">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
                      </div>
                      <div className="text-base sm:text-lg md:text-xl font-semibold leading-tight">
                        {item.title}
                      </div>
                    </div>
                    <div className="text-sm sm:text-base font-body leading-relaxed px-2 sm:px-4 text-left sm:text-center pt-1">
                      {item.text}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* ─── TikTok / Social Section ─── */}
        <motion.section
          className="py-12 md:py-20 bg-neutral-charcoal text-white mt-24 rounded-b-lg"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={staggerContainer(0.12)}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              variants={fadeSlideUp(50, 0.8)}
            >
              <h2
                className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-green-300 via-yellow-300 to-green-300 bg-clip-text text-transparent bg-[length:200%_auto]"
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
                  <img src={Tiktok} loading="lazy" alt="tiktok" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer" />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <img src={Instagram} loading="lazy" alt="instagram" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer" />
                </motion.a>
                <motion.a
                  href="https://facebook.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <img src={Facebook} loading="lazy" alt="facebook" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 cursor-pointer object-cover" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
              variants={staggerContainer(0.1)}
            >
              {tiktokLinks.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-sm"
                  variants={{
                    hidden: { opacity: 0, scale: 0.85, rotate: index % 2 === 0 ? -3 : 3 },
                    visible: {
                      opacity: 1, scale: 1, rotate: 0,
                      transition: { duration: 0.8, ease: easeOutCirc },
                    },
                  }}
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
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              variants={fadeSlideUp(30, 0.7)}
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
        </motion.section>

        {/* ─── FAQ Section ─── */}
        <motion.section
          className="py-12 md:py-20 mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={staggerContainer(0.1)}
        >
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              className="text-center mb-12 md:mb-16"
              variants={fadeSlideUp(50, 0.8)}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 flex items-center justify-center gap-4">
                <span className="h-px w-8 md:w-12 bg-green-400" />
                <span>FAQ</span>
                <span className="h-px w-8 md:w-12 bg-green-400" />
              </h2>
              <p className="text-md md:text-xl font-body text-muted-foreground max-w-xl mx-auto">
                Everything you need to know about Duks juices
              </p>
              <div className="mx-auto mt-4 w-16 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
            </motion.div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOutExpo } },
                  }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="border rounded-sm px-6 bg-card relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 scale-y-0 transition-transform duration-300 group-data-[state=open]:scale-y-100" />
                    <AccordionTrigger className="text-md font-semibold font-heading hover:text-secondary hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </motion.section>

        <Footer />
      </div>
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>
    </div>
  );
}
