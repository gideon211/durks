import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, Variants, easeOut, useAnimationFrame } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star,
  Leaf,
  Heart,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Carousel from "@/components/carousel/Carousel";
import HeroSection from "@/layout/HeroSection";
// Local assets in src/assets
import heroImage from "@/assets/hero-juice.webp";
import pureJuiceImage from "@/assets/pure-juice.webp";
import cleanseJuiceImage from "@/assets/cleanse-juice.webp";
import wellnessPacksImage from "@/assets/wellness-shot.webp";
import chooseImage from "@/assets/chooseImage.webp";
import eventsImage from "@/assets/events.webp";
import deskheroImage from "@/assets/desktopheroimage.webp";
import tiktok1 from "@/assets/tiktok-1.webp";
import tiktok2 from "@/assets/tiktok-2.webp";
import tiktok3 from "@/assets/tiktok-3.webp";
import tiktok4 from "@/assets/tiktok-4.webp";

import Instagram from "@/assets/instagram.svg";
import Tiktok from "@/assets/tiktok.svg";
import Facebook from "@/assets/facebook.svg";
import Twitter from "@/assets/twitter.svg";

// Public images (reference directly from /public/images)
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

const bundle1 = "/images/bundle1.jpeg";
const bundle2 = "/images/bundle2.jpeg";
const bundle3 = "/images/bundle3.jpeg";
const bundle4 = "/images/bundle4.jpeg";

const flavor1 = "/images/flavor1.jpg";
const flavor2 = "/images/flavor2.jpg";
const flavor3 = "/images/flavor3.jpg";
const flavor4 = "/images/flavor4.jpg";

import { useRef, useState, useEffect } from "react";
import TrainingPreview from "@/components/TrainingPreview"

const productCategories = [
  // 1. Bundles → 4 images
  {
    id: "bundles",
    name: "BUNDLES",
    slug: "bundle",
    images: [bundle3],
    fruits: "",
    description:
      "Perfectly curated juice packs to serve your unique quantity and dietary needs.",
  },

  // 3. Pure juices
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

  // 4. Cleanse juices
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

  // 5. Wellness shots
  {
    id: "shots",
    name: "WELLNESS SHOTS",
    description:
      "Small but mighty little potions of health. Let your shots do the waking up!",
    slug: "shots",
    image: wellnessPacksImage,
    fruits: "Ginger, Turmeric, Beetroot, Wheatgrass, Cayenne, Lemon",
  },

  // 6. Smoothies → 4 images
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

  // 7. Flavors → 4 images
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

  // 8. Cut Fruits → 4 images
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

  // 9. Gift packs → 4 images
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

  // 10. Events
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

const baseSpeed = 60;

const faqs = [
  {
    question: "Can I get juices now or I always have to preorder.",
    answer:
      "⁠We juice everyday fresh and we always have juice. We understand people have perculiar need for juices. To better serve you, preordering helps so you get your most preferred juice flavors, quantities and at your preferred time. ",
  },
  {
    question: "How long can juices stay preserves.",
    answer:
      "Fresh natural juices can do well only 3 days in the refrigerator. Fresh natural juices without preservatives are best keep frozen and can do up to 3 months frozen.",
  },
  {
    question: "How many flavors do you have?",
    answer:
      "We have a wide range of flavors between pure juices, cleanse juices, nutty juices and smoothies to handle different dietary and health needs. Don’t see your flavor online, simply connect to design your custom flavor.",
  },
  {
    question: "⁠Do you offer bulk juice? ",
    answer:
      "Yes we do bulk and white labeling starting from 300 bottles and above. Connect for more details.",
  },
];

const tiktokLinks = [
  { image: tiktok1, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok2, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok3, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok4, url: "https://www.tiktok.com/@duksjuice" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeOut } },
};

export default function Home() {
  // ref for the horizontal carousel
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // refs and state for the marquee ticker (moved hooks inside component to fix invalid hook call)
  const baseX = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useAnimationFrame((t, delta) => {
    const el = containerRef.current;
    if (!el) return;
    baseX.current -= (baseSpeed * delta) / 1000;
    if (Math.abs(baseX.current) >= el.scrollWidth / 2) {
      baseX.current = 0;
    }
    el.style.transform = `translateX(${baseX.current}px)`;
  });

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
    // scroll by ~80% of viewport width of the carousel
    const amount = Math.floor(el.clientWidth * 0.8);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section (unchanged) */}
        <HeroSection />

        {/* <motion.section
          className="w-full sm:py-8 md:pt-8 md:pb-8 lg:pt-16 lg:px-12 border-t border-transparent"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div
            className="mb-6 w-full text-center mt-16 px-4 sm:px-6 md:px-8 lg:px-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading font-bold text-center mb-2 leading-tight text-[clamp(1.25rem,3.5vw,2.5rem)]">
              A HABIT THAT YIELDS RESULTS
            </h1>

            <p className="text-center text-md text-gray-600 lg:py-2 leading-tight font-body">
              A gentle palate reset designed to elevate your cravings toward
              better nutrition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Carousel />
          </motion.div>

          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/products/cleanse"
              state={{ activeTab: "cleanse" }}
              className="inline-block bg-white text-green-700 text-base font-semibold py-2 px-4 rounded-full"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 ml-2 inline-block" />
            </Link>
          </motion.div>
        </motion.section> */}

        {/* Products Carousel with left/right arrows */}
        <motion.section
          className="py-[5rem] md:py-20 bg-muted/30 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">
                Explore Our Products
              </h2>
              <p className="text-md md:text-xl font-body text-muted-foreground">
                Discover the perfect juice for your lifestyle
              </p>
            </motion.div>

            {/* Wrapper for arrows + carousel */}
            <div className="relative">
              {/* Left Arrow */}
              <button
                aria-label="Scroll left"
                onClick={() => scrollCarousel("left")}
                className={`hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-md bg-white/90 hover:bg-white transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-40 pointer-events-auto"}`}
                style={{ transform: "translateY(-50%)" }}
              >
                <ChevronLeft className="w-6 h-6 text-neutral-900" />
              </button>

              {/* Right Arrow */}
              <button
                aria-label="Scroll right"
                onClick={() => scrollCarousel("right")}
                className={`hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-md bg-white/90 hover:bg-white transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-40 pointer-events-none"}`}
                style={{ transform: "translateY(-50%)" }}
              >
                <ChevronRight className="w-6 h-6 text-neutral-900" />
              </button>

              {/* Carousel */}
              <motion.div
                ref={carouselRef}
                className="w-full flex gap-4 overflow-x-auto pb-6 no-scrollbar smooth-scroll scroll-pl-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
                style={{ scrollBehavior: "smooth" }}
              >
                {productCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="w-[300px] flex-shrink-0"
                    variants={cardVariants}
                  >
                    <div className="relative rounded-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                      {/* FIXED HEIGHT IMAGE WRAPPER */}
                      <div className="relative h-[36rem] overflow-hidden">
                        {/* IMAGES */}
                        {category.images ? (
                          <div className="w-full h-full">
                            {category.images.slice(0, 4).map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                loading="lazy"
                                alt={`${category.name} ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={category.image}
                            loading="lazy"
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}

                        {/* STRONGER BLACK OVERLAY — FIXED HEIGHT */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />
                      </div>

                      {/* CONTENT OVERLAY — FIXED HEIGHT & NOT PUSHING IMAGE */}
                      <div className="absolute bottom-0 inset-x-0 p-4 backdrop-blur-md bg-black/40 rounded-t-2xl transition-all duration-700 md:group-hover:bg-black/60">
                        <div className="flex items-center justify-between">
                          <h2 className="text-white text-lg md:text-xl font-bold">
                            {category.name}
                          </h2>
                          <button className="w-8 h-8 bg-white text-green-700 rounded-full flex items-center justify-center text-2xl font-bold">
                            +
                          </button>
                        </div>

                        {/* FIXED HEIGHT TEXT WRAPPER SO DESCRIPTION NEVER PUSHES CARD */}
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
          </div>
        </motion.section>

        <div className="bg-green-600 text-white py-2 overflow-hidden font-lexend border-2 border-t-red-400">
          <motion.div
            ref={containerRef}
            className="flex gap-12 whitespace-nowrap will-change-transform"
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



        {/* <div>

            <TrainingPreview />
            
        </div> */}

        {/* Health Benefits (unchanged) */}
        <motion.section
          className="md:py-20 mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Why Choose Duks?
              </h2>
              <div>
                <motion.img
                  src={chooseImage}
                  loading="lazy"
                  alt="why choose us Image"
                  className="w-full object-cover h-[14rem] rounded-md lg:h-[30rem] lg:rounded-md py-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-md md:text-xl font-semibold text-muted-foreground max-w-2xl mx-auto">
                Every bottle is a commitment to your health and our planet
              </p>
            </motion.div>

            <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-8"
            variants={containerVariants}
            >
            {[
                {
                icon: Leaf,
                title: "Credibility",
                text: "Juices are all pure with no added sugar, preservatives and artificial colors. Juices are bottled as juiced.",
                },
                {
                icon: Sparkles,
                title: "Bursting with Benefits",
                text: "Cold-press technology preserves maximum vitamins, minerals, and enzymes.",
                },
                {
                icon: Heart,
                title: "Deliciously Elevated",
                text: "Our master blenders create flavor combinations that excite your taste buds while nourishing your body.",
                },
            ].map((item, index) => (
                <motion.div
                key={index}
                className="border border-green-400 rounded-md p-3 sm:p-4 md:p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                variants={cardVariants}
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
            ))}
            </motion.div>
          </div>
        </motion.section>

        {/* TikTok Section (unchanged) */}
        <motion.section
          className="py-12  md:py-20 bg-neutral-charcoal text-white mt-24 rounded-b-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Join us on our socials
              </h2>
              <p className="text-md md:text-xl font-body text-white/80">
                Follow @duks_juice for daily juice inspo, recipes, and wellness
                tips
              </p>
              <div className="flex gap-6 mx-auto justify-center mt-4">
                <a
                  href="https://www.tiktok.com/@duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={Tiktok}
                    loading="lazy"
                    alt="tiktok"
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer "
                  />
                </a>
                <a
                  href="https://www.instagram.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={Instagram}
                    loading="lazy"
                    alt="instagram"
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer "
                  />
                </a>
                <a
                  href="https://facebook.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={Facebook}
                    loading="lazy"
                    alt="facebook"
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 cursor-pointer object-cover"
                  />
                </a>
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {tiktokLinks.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-sm"
                  variants={cardVariants}
                >
                  <img
                    src={item.image}
                    loading="lazy"
                    alt={`TikTok post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-heading">
                      View on TikTok
                    </span>
                  </div>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
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

        {/* FAQ Section (unchanged) */}
        <motion.section
          className="py-12 md:py-20 mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
                FAQS
              </h2>
              <p className="text-md md:text-xl font-body text-muted-foreground">
                Everything you need to know about Duks juices
              </p>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <AccordionItem
                    value={`item-${index}`}
                    className="border rounded-sm px-6 bg-card"
                  >
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
    </div>
  );
}
