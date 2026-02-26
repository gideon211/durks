import React from "react";
import { Link } from "react-router-dom";
import { Phone, Instagram, MapPin, ArrowUpRight } from "lucide-react";
import Logo from "@/assets/logo.svg";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: "Pure Juices", slug: "pure-juice" },
    { label: "Cleanse Juices", slug: "cleanse" },
    { label: "Smoothies", slug: "smoothies" },
    { label: "Cut Fruits", slug: "cut-fruits" },
    { label: "Gift Packs", slug: "gift-packs" },
    { label: "Events", slug: "events" },
    { label: "Training", slug: "training" },
  ];

  return (
    <footer className="bg-neutral-charcoal text-white border-t border-border mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Duks" className="w-18 h-16 object-contain" />

            </div>

            <p className="mt-4 text-sm md:text-base text-white/85 leading-relaxed">
              Premium, carefully crafted juice blends for families, businesses, events, and wholesale orders.
            </p>

            {/* Social + Quick links */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/duks_juice"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Duks on Instagram"
                className="inline-flex items-center gap-2 text-white/90 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm">Instagram</span>
                <ArrowUpRight className="h-4 w-4 opacity-70" />
              </a>

              <Link
                to="/"
                className="text-sm text-white/90 hover:text-primary transition-colors underline underline-offset-4"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Links + Contact */}
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            {/* Products */}
            <div className="min-w-[180px]">
              <h3 className="font-heading font-bold text-base mb-4">Products</h3>
              <ul className="space-y-2">
                {productLinks.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-sm text-white/85 hover:text-primary transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="min-w-[220px]">
              <h3 className="font-heading font-bold text-base mb-4">Contact</h3>

              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="tel:+233202427880"
                    className="inline-flex items-center gap-2 text-white/90 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+233 202 427 880</span>
                  </a>
                </li>

                <li>
                  <a
                    href="tel:+233240076685"
                    className="inline-flex items-center gap-2 text-white/90 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+233 240 076 685</span>
                  </a>
                </li>

                <li className="pt-2">
                  <div className="flex items-center gap-2 font-semibold text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span>Physical Address</span>
                  </div>
                  <p className="mt-1 text-white/70 leading-relaxed">Madina Estate, Accra, Ghana</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-white/70">
          <p>&copy; {currentYear} Duks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};