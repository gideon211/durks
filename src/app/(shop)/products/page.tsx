import { Suspense } from "react";
import { Metadata } from "next";
import Products from "@/views/Products";

export const metadata: Metadata = {
  title: "Shop All Products | Duks Juice",
  description:
    "Browse our full range of cold-pressed juices, smoothies, cleanse packs, wellness shots, cut fruits, and gift packs.",
  openGraph: {
    title: "Shop All Products | Duks Juice",
    description:
      "Browse our full range of cold-pressed juices, smoothies, cleanse packs, and more.",
    url: "https://duksjuice.com/products",
  },
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading products...</p>
        </div>
      }
    >
      <Products />
    </Suspense>
  );
}
