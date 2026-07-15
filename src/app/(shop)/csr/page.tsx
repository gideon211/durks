import { Metadata } from "next";
import CSR from "@/views/CSR";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Corporate Social Responsibility | Duks Juice",
  description:
    "Learn about Duks Juice's commitment to community health, education, and sustainability through our CSR initiatives.",
  alternates: {
    canonical: "/csr",
  },
  openGraph: {
    title: "CSR | Duks Juice",
    description:
      "Our commitment to community health, education, and sustainability.",
    url: "https://duksjuice.com/csr",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CSR | Duks Juice",
      },
    ],
  },
  twitter: {
    images: ["/og-image.png"],
  },
};

export default function CSRPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Corporate Social Responsibility", item: `${BASE}/csr` },
          ],
        }}
      />
      <CSR />
    </>
  );
}
