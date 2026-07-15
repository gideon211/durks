import { Suspense } from "react";
import { Metadata } from "next";
import Products from "@/views/Products";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

export const metadata: Metadata = {
  title: "Shop All Products | Duks Juice",
  description:
    "Browse our full range of cold-pressed juices, smoothies, cleanse packs, wellness shots, cut fruits, and gift packs.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Shop All Products | Duks Juice",
    description:
      "Browse our full range of cold-pressed juices, smoothies, cleanse packs, and more.",
    url: "https://duksjuice.com/products",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shop All Products | Duks Juice",
      },
    ],
  },
  twitter: {
    images: ["/og-image.png"],
  },
};

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Products", item: `${BASE}/products` },
          ],
        }}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading products...</p>
          </div>
        }
      >
        <Products />
      </Suspense>
    </>
  );
}
