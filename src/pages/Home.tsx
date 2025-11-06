import { Button } from "@/components/ui/button";
import { motion, Variants, easeOut } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Star, Leaf, Heart, Sparkles, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-juice.png";
import pureJuiceImage from "@/assets/pure-juice.jpg";
import cleanseJuiceImage from "@/assets/cleanse-juice.jpg";
import smoothiesImage from "@/assets/smoothies.jpg";
import cutFruitsImage from "@/assets/cut-fruits.jpg";
import giftPacksImage from "@/assets/gift-packs.jpg";
import wellnessPacksImage from "@/assets/wellness-shot.jpg";
import chooseImage from "@/assets/chooseImage.jpg";
import eventsImage from "@/assets/events.jpg";
import deskheroImage from "@/assets/desktopheroimage.jpg";
import tiktok1 from "@/assets/tiktok-1.jpg";
import tiktok2 from "@/assets/tiktok-2.jpg";
import tiktok3 from "@/assets/tiktok-3.jpg";
import tiktok4 from "@/assets/tiktok-4.jpg";

const productCategories = [
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice", image: pureJuiceImage, fruits: "Oranges, Apples, Watermelon, Pineapple, Grapes" },
  { id: "cleanse", name: "CLEANSE JUICES", slug: "cleanse", image: cleanseJuiceImage, fruits: "Kale, Spinach, Cucumber, Celery, Lemon, Ginger, Green Apple" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies", image: smoothiesImage, fruits: "Bananas, Berries, Mangos, Avocado, Dates, Coconut" },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits", image: cutFruitsImage, fruits: "Pineapple, Watermelon, Cantaloupe, Berries, Grapes, Kiwi" },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs", image: tiktok2, fruits: "Assorted Premium Selection" },
  { id: "events", name: "EVENTS", slug: "events", image: eventsImage, fruits: "Custom Event-Based Selection" },
  { id: "shots", name: "WELLNESS SHOTS", slug: "shots", image: wellnessPacksImage, fruits: "Turmeric, Ginger, Beetroot, Wheatgrass, Cayenne" }
];

const faqs = [
  { question: "How long do your fresh juices stay fresh?", answer: "Our cold-pressed juices stay fresh for 3-5 days when refrigerated at 35-40°F." },
  { question: "Are your juices 100% organic?", answer: "Yes! We source 100% USDA certified organic fruits and vegetables from local farms." },
  { question: "Do you offer bulk or wholesale pricing?", answer: "Absolutely! We offer special bulk pricing for orders of 20+ bottles and wholesale partnerships for cafes, gyms, and retailers." },
  { question: "What's the difference between juice and smoothie?", answer: "Our juices are cold-pressed, extracting pure liquid from fruits/vegetables. Smoothies blend whole ingredients, retaining all fiber." },
  { question: "Can I customize my juice cleanse program?", answer: "Yes! We offer 1, 3, 5, and 7-day cleanse programs. You can customize based on your goals and dietary preferences." }
];

const tiktokLinks = [
  { image: tiktok1, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok2, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok3, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok4, url: "https://www.tiktok.com/@duksjuice" }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeOut } }
};

export default function Home() {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-white">

        {/* Hero Section */}
        <motion.section
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
            {/* Desktop Hero */}
            <motion.img
              src={deskheroImage}
              alt="Fresh Organic Cold-Pressed Juice"
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="hidden lg:block w-full h-full object-cover"
            />

            {/* Mobile Hero */}
            <motion.img
              src={heroImage}
              alt="Fresh Organic Cold-Pressed Juice"
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="block lg:hidden w-full h-full object-cover"
            />

            {/* Overlay Desktop */}
            <div className="hidden lg:flex absolute inset-0 bg-gradient-to-t from-neutral-charcoal/80 via-neutral-charcoal/40 to-transparent items-center justify-center">
              <div className="container mx-auto px-4 text-left">
                <motion.div
                  className="max-w-3xl space-y-4 animate-fade-in"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                >
                  <h1 className="text-8xl lg:text-7xl font-heading font-bold text-white leading-wide tracking-wide">
                    Fall Into <br />
                    <span className="text-primary">Wellness</span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/90 max-w-2xl">
                    Cold-pressed perfection. Zero additives. Maximum flavor.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <Button asChild size="md" variant="hero">
                      <Link to="/products">Shop All Juices</Link>
                    </Button>
                    <Button asChild size="md" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-foreground">
                      <Link to="/products/cleanse">Start Your Cleanse</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Mobile text */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:hidden py-6 mt-2 flex flex-col items-center text-center space-y-4"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            <h1 className="text-5xl sm:text-4xl font-bold text-neutral-900">
              Fall into<br />
              <span className="text-primary">Wellness</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-700 max-w-md px-4">
              Cold-pressed perfection. Zero additives. Maximum flavor.
            </p>
            <Button asChild size="md" variant="hero" className="rounded-sm flex items-center gap-2">
              <Link to="/products">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.section>

        {/* Products Carousel */}
        <motion.section
          className="py-[5rem] md:py-20 bg-muted/30"
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
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold mb-2">Explore Our Products</h2>
              <p className="text-md md:text-xl font-body text-muted-foreground">Discover the perfect juice for your lifestyle</p>
            </motion.div>

            <motion.div
              className="w-full flex gap-4 overflow-x-auto pb-6 no-scrollbar smooth-scroll"
            >
{productCategories.map((category) => (
  <motion.div
    key={category.id}
    className="w-[300px] flex-shrink-0"
    variants={cardVariants}
  >
    <div
      className="relative rounded-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
    //   style={{ backgroundColor: category.bgColor }}
    >
      {/* Image section */}
      <div className="relative h-[32rem] md:h-[34rem] lg:h-[36rem] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Content section */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 backdrop-blur-md rounded-t-2xl transition-all duration-700 
        bg-black/30 md:group-hover:bg-black/60`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg md:text-xl font-bold">
            {category.name}
          </h2>
          <button className="w-8 h-8 bg-white text-green-700 rounded-full flex items-center justify-center text-2xl font-bold">
            +
          </button>
        </div>

        {/* Description + Button */}
        <div
          className="mt-2 text-white text-sm leading-relaxed 
          opacity-100 translate-y-0 
          md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-700"
        >
  
          <p className="text-xs mt-1 opacity-80">Key Ingredients:</p>
          <p className="text-xs font-medium mb-3">{category.fruits}</p>
          <Link
            to={`/products/${category.slug}`}
            className=" flex mt-2 bg-white text-green-700 font-semibold py-2 px-4 rounded-full text-sm "
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
            
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
))}



            </motion.div>
          </div>
        </motion.section>

        {/* Health Benefits */}
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
              <h2 className="text-xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Why Choose Duk's?</h2>
              <div>
                <motion.img src={chooseImage} alt="why choose us Image" className="w-full object-cover h-[14rem] rounded-md lg:h-[30rem] lg:rounded-md py-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} />
              </div>
              <p className="text-md md:text-xl font-body text-muted-foreground max-w-2xl mx-auto">
                Every bottle is a commitment to your health and our planet
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-6 md:gap-8 rounded-md" variants={containerVariants}>
              {[{ icon: Leaf, title: "Totally Organic", text: "USDA certified organic fruits and vegetables from sustainable farms. No pesticides, no GMOs, no compromises." },
                { icon: Sparkles, title: "Bursting with Benefits", text: "Cold-press technology preserves maximum vitamins, minerals, and enzymes." },
                { icon: Heart, title: "Deliciously Elevated", text: "Our master blenders create flavor combinations that excite your taste buds while nourishing your body." }
              ].map((item, index) => (
                <motion.div key={index} className="border rounded p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2" variants={cardVariants}>
                  <div className="flex items-center gap-4 px-4 py-2">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-xl font-medium">{item.title}</div>
                  </div>
                  <div>
                    <div className="text-base font-body leading-relaxed px-4 text-center py-2">{item.text}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* TikTok Section */}
        <motion.section
          className="py-12 md:py-20 bg-neutral-charcoal text-white mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12 md:mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Join Us On TikTok</h2>
              <p className="text-md md:text-xl font-body text-white/80">Follow @duks_juice for daily juice inspo, recipes, and wellness tips</p>
            </motion.div>

            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {tiktokLinks.map((item, index) => (
                <motion.a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-sm" variants={cardVariants}>
                  <img src={item.image} alt={`TikTok post ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-heading">View on TikTok</span>
                  </div>
                </motion.a>
              ))}
            </motion.div>

            <motion.div className="text-center mt-12" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Button asChild size="md" className="bg-primary hover:bg-primary/90 text-foreground font-bold">
                <a href="https://www.tiktok.com/@duks_juice" target="_blank" rel="noopener noreferrer">Follow Duks</a>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-12 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div className="text-center mb-12 md:mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">FAQS</h2>
              <p className="text-md md:text-xl font-body text-muted-foreground">Everything you need to know about Duk's juices</p>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <AccordionItem value={`item-${index}`} className="border rounded-sm px-6 bg-card">
                    <AccordionTrigger className="text-md font-semibold font-heading hover:text-secondary hover:no-underline">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm font-semibold leading-relaxed pt-2">{faq.answer}</AccordionContent>
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
