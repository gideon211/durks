"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import Image from "next/image";
import { Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ChristmasBundles from "@/components/christmas/ChristmasBundles";
import WhyDuks from "@/components/home/WhyDuks";
import ProductRail from "@/components/home/ProductRail";
import type { PromoPhase } from "@/lib/christmasPromo";

const marqueeMessages = [
  "Packed with vitamins and natural energy",
  "Boost your immunity with every sip",
  "No added sugar, only pure fruit goodness",
  "Stay hydrated and refreshed the healthy way",
];

const faqs = [
  { question: "Can I get juices now, or do I always have to preorder?", answer: "We make fresh juice every day and always have juice in stock. Preordering helps ensure you get your preferred flavors and quantities at your preferred time." },
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
});

export default function Home({
  promoPhase = "hidden",
  promoDaysLeft = 0,
}: {
  promoPhase?: PromoPhase;
  promoDaysLeft?: number;
}) {
  const sectionViewport = { once: true, amount: 0.15 as const };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-white">
        <HeroSection />

        <ChristmasBundles phase={promoPhase} daysLeft={promoDaysLeft} />

        {/* ─── Products ─── */}
        <ProductRail />

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
        <WhyDuks />

        {/* ─── TikTok / Social Section ─── */}
        <section className="py-12 md:py-20 bg-neutral-charcoal text-white">
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/tiktok.svg" loading="lazy" alt="tiktok" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer" />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 object-cover cursor-pointer" />
                </motion.a>
                <motion.a
                  href="https://facebook.com/duks_juice"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <Image
                    src={item.image}
                    alt={`TikTok post ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/70 mb-3">Questions</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-4 text-neutral-charcoal">
                Frequently Asked
              </h2>
              <p className="text-base text-neutral-charcoal/60 max-w-md mx-auto">
                Everything you need to know about Duks Juice
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
                    className="rounded-2xl border border-forest/10 px-5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden transition-colors data-[state=open]:border-forest/25 data-[state=open]:shadow-[0_8px_24px_-12px_rgba(16,61,22,0.25)]"
                  >
                    <AccordionTrigger className="text-sm sm:text-base font-semibold tracking-tight text-neutral-charcoal hover:text-forest hover:no-underline py-4 [&>svg]:text-forest [&[data-state=open]>svg]:text-gold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-neutral-charcoal/60 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            {/* Closing CTA */}
            <motion.div
              className="mt-10"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp(10)}
            >
              <div className="rounded-2xl bg-forest px-6 py-8 text-center sm:px-10">
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Still have a question?
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                  We&apos;re happy to help — call or message us and we&apos;ll get back to you.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="tel:+233202427880"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-gold hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Call us
                  </a>
                  <a
                    href="https://wa.me/233202427880"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
