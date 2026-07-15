import { Metadata } from "next";
import BulkQuote from "@/views/BulkQuote";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bulk Order Quote | Duks Juice",
  description:
    "Request a custom quote for bulk juice orders, corporate events, weddings, and wholesale supply.",
  alternates: {
    canonical: "/bulk-quote",
  },
  openGraph: {
    title: "Bulk Order Quote | Duks Juice",
    description: "Request a custom quote for bulk juice orders.",
    url: "https://duksjuice.com/bulk-quote",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bulk Order Quote | Duks Juice",
      },
    ],
  },
  twitter: {
    images: ["/og-image.png"],
  },
};

export default function BulkQuotePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Bulk Order Quote", item: `${BASE}/bulk-quote` },
          ],
        }}
      />
      <BulkQuote />
    </>
  );
}
