import { Metadata } from "next";
import Training from "@/views/Training";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Juice Training | Duks Juice",
  description:
    "Learn the art of cold-pressed juicing with Duks Juice. Professional training for aspiring juice entrepreneurs.",
  alternates: {
    canonical: "/training",
  },
  openGraph: {
    title: "Juice Training | Duks Juice",
    description:
      "Professional training for aspiring juice entrepreneurs.",
    url: "https://duksjuice.com/training",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Juice Training | Duks Juice",
      },
    ],
  },
  twitter: {
    images: ["/og-image.png"],
  },
};

export default function TrainingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Juice Training", item: `${BASE}/training` },
          ],
        }}
      />
      <Training />
    </>
  );
}
