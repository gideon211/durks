import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { Star, Leaf, Heart, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-juice.jpg";
import pureJuiceImage from "@/assets/pure-juice.jpg";
import cleanseJuiceImage from "@/assets/cleanse-juice.jpg";
import smoothiesImage from "@/assets/smoothies.jpg";
import cutFruitsImage from "@/assets/cut-fruits.jpg";
import giftPacksImage from "@/assets/gift-packs.jpg";
import eventsImage from "@/assets/events.jpg";
import tiktok1 from "@/assets/tiktok-1.jpg";
import tiktok2 from "@/assets/tiktok-2.jpg";
import tiktok3 from "@/assets/tiktok-3.jpg";
import tiktok4 from "@/assets/tiktok-4.jpg";

const productCategories = [
  {
    id: "pure-juice",
    name: "PURE JUICES",
    slug: "pure-juice",
    image: pureJuiceImage,
    description: "Experience nature's finest with our cold-pressed pure juices. Made from 100% fresh fruits with zero additives, each bottle captures the vibrant flavors of oranges, apples, watermelons, and pineapples.",
    fruits: "Oranges, Apples, Watermelon, Pineapple, Grapes",
    benefit: "High in Vitamin C & Natural Energy"
  },
  {
    id: "cleanse",
    name: "CLEANSE JUICES",
    slug: "cleanse",
    image: cleanseJuiceImage,
    description: "Detoxify and rejuvenate your body with our specially crafted cleanse juices. Expertly blended combinations of leafy greens, cucumber, celery, lemon, and ginger work together to flush toxins and boost metabolism.",
    fruits: "Kale, Spinach, Cucumber, Celery, Lemon, Ginger, Green Apple",
    benefit: "Natural Detox & Metabolism Boost"
  },
  {
    id: "smoothies",
    name: "SMOOTHIES",
    slug: "smoothies",
    image: smoothiesImage,
    description: "Creamy, dreamy, and packed with nutrition! Our smoothies blend premium fruits with Greek yogurt, oats, and superfoods like chia seeds. Perfect for breakfast or post-workout fuel.",
    fruits: "Bananas, Berries, Mangos, Avocado, Dates, Coconut",
    benefit: "Protein-Rich & Sustained Energy"
  },
  {
    id: "cut-fruits",
    name: "CUT FRUITS",
    slug: "cut-fruits",
    image: cutFruitsImage,
    description: "Fresh, hand-cut fruits ready to enjoy! Our fruit cups feature a colorful medley of seasonal fruits, perfectly portioned for snacking. Washed, cut, and packed fresh daily.",
    fruits: "Pineapple, Watermelon, Cantaloupe, Berries, Grapes, Kiwi",
    benefit: "Convenient & Vitamin-Packed Snacking"
  },
  {
    id: "gift-packs",
    name: "GIFT PACKS",
    slug: "gift-packs",
    image: giftPacksImage,
    description: "Share the gift of health with our beautifully curated gift packs. Each collection features an assortment of our bestselling juices, smoothies, and wellness shots, elegantly packaged.",
    fruits: "Assorted Premium Selection",
    benefit: "Thoughtful Wellness Gifting"
  },
  {
    id: "events",
    name: "EVENTS",
    slug: "events",
    image: eventsImage,
    description: "Elevate your events with our bulk juice catering service. From corporate wellness programs to weddings and festivals, we provide fresh, custom juice bars with professional service.",
    fruits: "Custom Event-Based Selection",
    benefit: "Professional Catering & Bulk Orders"
  },
  {
    id: "shots",
    name: "WORKOUT SHOTS",
    slug: "shots",
    image: pureJuiceImage,
    description: "Power-packed 2oz wellness shots designed for peak performance. Concentrated blends deliver instant energy, reduce inflammation, and accelerate recovery. Perfect pre or post-workout fuel.",
    fruits: "Turmeric, Ginger, Beetroot, Wheatgrass, Cayenne",
    benefit: "Performance & Quick Recovery"
  }
];

const testimonials = [
  {
    name: "Sarah Martinez",
    category: "Pure Juices",
    rating: 5,
    text: "The pure orange juice from Duk's is incredible! You can taste the freshness in every sip. My kids actually prefer this over sugary drinks now.",
    location: "Los Angeles, CA"
  },
  {
    name: "James Chen",
    category: "Cleanse Juices",
    rating: 5,
    text: "I completed their 3-day cleanse program and felt absolutely amazing. My energy levels skyrocketed and I lost 5 pounds!",
    location: "San Francisco, CA"
  },
  {
    name: "Emily Johnson",
    category: "Smoothies",
    rating: 5,
    text: "These smoothies are a lifesaver! The berry blast smoothie is my post-workout ritual. Creamy, delicious, and keeps me full for hours.",
    location: "Austin, TX"
  },
  {
    name: "Michael Roberts",
    category: "Workout Shots",
    rating: 5,
    text: "These wellness shots are game-changers! The turmeric ginger shot gives me such a boost. Less joint pain and faster recovery times.",
    location: "Miami, FL"
  },
  {
    name: "Priya Patel",
    category: "Events",
    rating: 5,
    text: "We hired Duk's for our corporate wellness event and they were phenomenal! The juice bar was a huge hit with our employees!",
    location: "New York, NY"
  }
];

const faqs = [
  {
    question: "How long do your fresh juices stay fresh?",
    answer: "Our cold-pressed juices stay fresh for 3-5 days when refrigerated at 35-40°F. We use HPP (High Pressure Processing) to maintain freshness without preservatives."
  },
  {
    question: "Are your juices 100% organic?",
    answer: "Yes! We source 100% USDA certified organic fruits and vegetables from local farms. We never use pesticides, GMOs, or artificial additives."
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer: "Absolutely! We offer special bulk pricing for orders of 20+ bottles and wholesale partnerships for cafes, gyms, and retailers."
  },
  {
    question: "What's the difference between juice and smoothie?",
    answer: "Our juices are cold-pressed, extracting pure liquid from fruits/vegetables. Smoothies blend whole ingredients, retaining all fiber."
  },
  {
    question: "Can I customize my juice cleanse program?",
    answer: "Yes! We offer 1, 3, 5, and 7-day cleanse programs. You can customize based on your goals and dietary preferences."
  }
];

const tiktokLinks = [
  { image: tiktok1, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok2, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok3, url: "https://www.tiktok.com/@duksjuice" },
  { image: tiktok4, url: "https://www.tiktok.com/@duksjuice" }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Fresh Organic Cold-Pressed Juice" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-charcoal/80 via-neutral-charcoal/40 to-transparent flex items-end md:items-center justify-center">
          <div className="container mx-auto px-4 pb-12 md:pb-0 text-center">
            <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight tracking-tight">
                Refresh Your Day with<br />
                <span className="text-primary">100% Organic Juice</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl font-body text-white/90 max-w-2xl mx-auto">
                Cold-pressed perfection. Zero additives. Maximum flavor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" variant="hero">
                  <Link to="/products">Shop All Juices</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-foreground">
                  <Link to="/products/cleanse">Start Your Cleanse</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health Benefits */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Why Choose Duk's?</h2>
            <p className="text-lg md:text-xl font-body text-muted-foreground max-w-2xl mx-auto">
              Every bottle is a commitment to your health and our planet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl font-heading">Totally Organic</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base font-body leading-relaxed">
                  USDA certified organic fruits and vegetables from sustainable farms. No pesticides, no GMOs, no compromises. Every ingredient is traceable from farm to bottle.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl font-heading">Bursting with Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base font-body leading-relaxed">
                  Cold-press technology preserves maximum vitamins, minerals, and enzymes. Powerful antioxidants, natural energy, and immune support in every bottle.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl font-heading">Deliciously Elevated</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base font-body leading-relaxed">
                  Our master blenders create flavor combinations that excite your taste buds while nourishing your body. Premium taste meets premium nutrition.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Carousel */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Explore Our Products</h2>
            <p className="text-lg md:text-xl font-body text-muted-foreground">Discover the perfect juice for your lifestyle</p>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {productCategories.map((category) => (
                <CarouselItem key={category.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-charcoal/80 to-transparent" />
                      <CardTitle className="absolute bottom-4 left-4 text-2xl font-heading font-bold text-white">
                        {category.name}
                      </CardTitle>
                    </div>
                    <CardContent className="space-y-4 pt-6">
                      <p className="font-body leading-relaxed min-h-[100px] text-sm md:text-base">{category.description}</p>
                      
                      <div className="space-y-2 py-4 border-t">
                        <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Key Ingredients:</p>
                        <p className="text-sm">{category.fruits}</p>
                      </div>

                      <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
                        <p className="text-sm font-semibold text-accent flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {category.benefit}
                        </p>
                      </div>

                      <Button asChild className="w-full bg-secondary hover:bg-secondary/90">
                        <Link to={`/products/${category.slug}`}>Shop Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg md:text-xl font-body text-muted-foreground">Real stories from real juice lovers</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg font-heading">{testimonial.name}</CardTitle>
                  <CardDescription className="text-sm">{testimonial.category} • {testimonial.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 italic leading-relaxed font-body">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TikTok */}
      <section className="py-12 md:py-20 bg-neutral-charcoal text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Join Us On TikTok</h2>
            <p className="text-lg md:text-xl font-body text-white/80">Follow @duksjuice for daily juice inspo, recipes, and wellness tips</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {tiktokLinks.map((item, index) => (
              <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-lg">
                <img src={item.image} alt={`TikTok post ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-heading">View on TikTok</span>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-foreground font-bold">
              <a href="https://www.tiktok.com/@duksjuice" target="_blank" rel="noopener noreferrer">Follow @duksjuice</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg md:text-xl font-body text-muted-foreground">Everything you need to know about Duk's juices</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold font-heading hover:text-secondary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base font-body leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
