import { Metadata } from "next";
import Contact from "@/views/Contact";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us | Duks Juice",
  description:
    "Get in touch with Duks Juice for bulk orders, custom juice blends, corporate events, and wholesale inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Duks Juice",
    description:
      "Get in touch for bulk orders, custom blends, and wholesale inquiries.",
    url: "https://duksjuice.com/contact",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact Us | Duks Juice",
      },
    ],
  },
  twitter: {
    images: ["/og-image.png"],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Contact Us", item: `${BASE}/contact` },
          ],
        }}
      />
      <Contact />
    </>
  );
}
