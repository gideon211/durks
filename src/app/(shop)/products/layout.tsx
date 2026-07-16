"use client";

import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Banner from "@/components/CallToOrderBanner";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="mt-20 lg:mt-32">
        <Banner />
      </div>
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
